// server/server.js
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('JWT_SECRET:', process.env.JWT_SECRET);


// Load Mongoose models
const Response = require('./models/Response');
const User = require('./models/User');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // Security middleware

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

// JWT Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Received token:', token);

  if (!token) {
    console.error('No token provided.');
    return res.status(401).json({ error: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Invalid token:', err);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Get username
app.get('/api/get-username', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    res.json({ username: user.username });
  } catch (err) {
    console.error('Error fetching username:', err);
    res.status(500).json({ error: 'Failed to fetch username.' });
  }
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    tempId: Joi.string().min(1).optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, email, password, tempId } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const user = new User({ username, email, password });
    await user.save();

    // Associate responses with user
    if (tempId) {
      await Response.updateMany({ tempId }, { user: user._id, tempId: null });
    }

    // Generate JWT token and send response
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    
    res.status(201).json({ message: 'User registered successfully.', token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    tempId: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { email, password, tempId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Associate responses with user
    if (tempId) {
      await Response.updateMany({ tempId }, { user: user._id, tempId: null });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Function to calculate domain scores
function calculateDomainScores(responses) {
  const domainScores = {};

  if (!Array.isArray(responses)) {
    console.error('Responses is not an array');
    return domainScores;
  }

  responses.forEach(({ domain, value }) => {
    domainScores[domain] = (domainScores[domain] || 0) + Number(value);
  });

  return domainScores;
}

/// API endpoint to handle responses submission
app.post('/api/submit-responses', async (req, res) => {
  const { responses } = req.body;

  if (!responses) {
    console.error('No responses in request body');
    return res.status(400).json({ error: 'No responses provided' });
  }

  // Validate responses
  const schema = Joi.object({
    responses: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().required(),
          domain: Joi.string().required(),
          value: Joi.number().integer().min(1).max(5).required(),
        })
      )
      .required(),
  });

  const { error } = schema.validate({ responses });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Calculate domain scores
  const domainScores = calculateDomainScores(responses);

  // Calculate total score
  const totalPossibleScore = responses.length * 5; // Максимальный возможный балл (количество вопросов * 5)
  const totalAchievedScore = responses.reduce((acc, response) => acc + response.value, 0); // Сумма полученных баллов
  const totalScore = (totalAchievedScore / totalPossibleScore) * 100; // Приводим к процентам

  // Generate a temporary ID
  const tempId = uuidv4();

  // Save to database without user association
  const newResponse = new Response({ tempId, responses, domainScores, totalScore });
  try {
    await newResponse.save();
    res.json({ tempId }); // Send tempId to the client
  } catch (err) {
    console.error('Error saving response:', err);
    res.status(500).json({ error: 'Failed to save responses.' });
  }
});

// API endpoint to handle responses submission for authenticated users
app.post('/api/submit-responses-auth', authMiddleware, async (req, res) => {
  const { responses } = req.body;
  const userId = req.user.userId;

  if (!responses) {
    console.error('No responses in request body');
    return res.status(400).json({ error: 'No responses provided' });
  }

  // Validate responses
  const schema = Joi.object({
    responses: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().required(),
          domain: Joi.string().required(),
          value: Joi.number().integer().min(1).max(5).required(),
        })
      )
      .required(),
  });

  const { error } = schema.validate({ responses });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Calculate domain scores
  const domainScores = calculateDomainScores(responses);

  // Calculate total score
  const totalPossibleScore = responses.length * 5; // Максимальный возможный балл
  const totalAchievedScore = responses.reduce((acc, response) => acc + response.value, 0);
  const totalScore = (totalAchievedScore / totalPossibleScore) * 100;

  // Save to database with user association
  const newResponse = new Response({ user: userId, responses, domainScores, totalScore });
  try {
    await newResponse.save();
    res.status(200).json({ message: 'Responses submitted successfully.' });
  } catch (err) {
    console.error('Error saving response:', err);
    res.status(500).json({ error: 'Failed to save responses.' });
  }
});

// API endpoint to get previous results
app.get('/api/get-previous-results', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const responses = await Response.find({ user: userId }).sort({ date: -1 });
    res.json(responses);
  } catch (err) {
    console.error('Error fetching previous results:', err);
    res.status(500).json({ error: 'An error occurred while fetching previous results.' });
  }
});

// API endpoint to save test results when retaking the test
app.post('/api/save-results', authMiddleware, async (req, res) => {
  const schema = Joi.object({
    domainScores: Joi.object().required(),
    date: Joi.date().required(),
    responses: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().required(),
          domain: Joi.string().required(),
          value: Joi.number().integer().min(1).max(5).required(),
        })
      )
      .required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { domainScores, date, responses } = value;

  // Calculate total score
  const totalPossibleScore = responses.length * 5;
  const totalAchievedScore = responses.reduce((acc, response) => acc + response.value, 0);
  const totalScore = (totalAchievedScore / totalPossibleScore) * 100;

  const newResponse = new Response({
    user: req.user.userId,
    responses,
    domainScores,
    totalScore,
    date,
  });
  try {
    await newResponse.save();
    res.status(200).json({ message: 'Results saved successfully.' });
  } catch (err) {
    console.error('Error saving results:', err);
    res.status(500).json({ error: 'An error occurred while saving the results.' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For testing purposes
