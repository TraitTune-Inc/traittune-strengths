import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Results = () => {
  const navigate = useNavigate();
  const [previousResults, setPreviousResults] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // Fetch previous test results for the user from the database
    const fetchPreviousResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/get-previous-results', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPreviousResults(response.data);

        if (response.data.length > 0) {
          // Use the most recent result as the current result
          const [latestResult, previousResult] = response.data;

          setCurrentResult(latestResult);

          // Calculate progress if there is a previous result
          if (previousResult) {
            calculateProgress(latestResult, previousResult);
          }
        }
      } catch (err) {
        console.error('Error fetching previous results:', err);
      }
    };

    fetchPreviousResults();
  }, []);

  const calculateProgress = (current, previous) => {
    const currentOverallScore = current.totalScore;
    const lastOverallScore = previous.totalScore;

    // Calculate the progress or regression
    const progressValue = currentOverallScore - lastOverallScore;
    setProgress(progressValue);
  };

  const handleRetakeTest = () => {
    // Navigate back to the test start page
    navigate('/questionnaire');
  };

  if (!currentResult) {
    return <div>No results to display.</div>;
  }

  // Function to determine proficiency level based on percentage score
  const getProficiencyLevel = (percentageScore) => {
    if (percentageScore >= 80) return 'Expert';
    if (percentageScore >= 60) return 'Proficient';
    if (percentageScore >= 40) return 'Intermediate';
    if (percentageScore >= 20) return 'Beginner';
    return 'Novice';
  };

  // Interpretations for each domain and level
  const interpretations = {
    leadership: {
      Expert: 'You are an expert leader with exceptional skills.',
      Proficient: 'You have strong leadership abilities.',
      Intermediate: 'You are developing solid leadership skills.',
      Beginner: 'You are beginning to explore leadership.',
      Novice: 'You have opportunities to develop leadership skills.',
    },
    communication: {
      Expert: 'You excel in conveying ideas clearly and effectively.',
      Proficient: 'You communicate your thoughts well and engage others effectively.',
      Intermediate: 'You communicate adequately but have room for improvement.',
      Beginner: 'You are starting to develop your communication skills.',
      Novice: 'You may find it challenging to express your ideas clearly.',
    },
    'problem-solving': {
      Expert: 'You consistently find innovative and effective solutions to complex problems.',
      Proficient: 'You effectively solve problems and think critically.',
      Intermediate: 'You are capable of solving problems with some guidance.',
      Beginner: 'You are developing your problem-solving abilities.',
      Novice: 'You may struggle with solving problems and need support.',
    },
    creativity: {
      Expert: 'You consistently generate original and impactful ideas.',
      Proficient: 'You often think creatively and bring fresh perspectives.',
      Intermediate: 'You demonstrate creativity but can enhance it further.',
      Beginner: 'You are beginning to explore your creative potential.',
      Novice: 'You may find it challenging to think creatively.',
    },
    adaptability: {
      Expert: 'You easily adapt to changing situations and thrive in dynamic environments.',
      Proficient: 'You handle change well and adjust your approach as needed.',
      Intermediate: 'You can adapt to change with some effort.',
      Beginner: 'You are developing your ability to adapt to new situations.',
      Novice: 'You may find it difficult to adjust to changes.',
    },
    collaboration: {
      Expert: 'You excel at working with others to achieve common goals.',
      Proficient: 'You effectively collaborate and contribute to team success.',
      Intermediate: 'You work well in teams but can enhance your collaboration skills.',
      Beginner: 'You are starting to develop your teamwork abilities.',
      Novice: 'You may find it challenging to work collaboratively.',
    },
    'emotional-intelligence': {
      Expert: 'You have a high level of emotional intelligence and understand both your own and others\' emotions.',
      Proficient: 'You effectively manage your emotions and empathize with others.',
      Intermediate: 'You are developing your emotional intelligence and awareness.',
      Beginner: 'You are beginning to recognize and understand emotions in yourself and others.',
      Novice: 'You may struggle with managing emotions and empathizing with others.',
    },
    'strategic-thinking': {
      Expert: 'You consistently think strategically and make decisions that align with long-term goals.',
      Proficient: 'You effectively plan and consider long-term outcomes in your decisions.',
      Intermediate: 'You demonstrate strategic thinking but can improve in aligning actions with goals.',
      Beginner: 'You are developing your strategic thinking abilities.',
      Novice: 'You may find it challenging to think strategically and align actions with goals.',
    },
  };

  // Calculate number of questions per domain
  const domainQuestionCounts = {};
  currentResult.responses.forEach((response) => {
    const domain = response.domain;
    domainQuestionCounts[domain] = (domainQuestionCounts[domain] || 0) + 1;
  });

  // Sort the domainScores from highest to lowest
  const sortedScores = Object.entries(currentResult.domainScores).sort(
    ([, scoreA], [, scoreB]) => scoreB - scoreA
  );

  // Use totalScore from currentResult
  const totalScore = currentResult.totalScore.toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h1>Your Strengths</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', maxWidth: '800px' }}>
        {sortedScores.map(([domain, score], index) => {
          const numberOfQuestions = domainQuestionCounts[domain];
          const maxScorePerDomain = numberOfQuestions * 5; // Максимальный балл за домен
          const percentageScore = (score / maxScorePerDomain) * 100;

          const level = getProficiencyLevel(percentageScore);
          const description = interpretations[domain][level] || 'No interpretation available.';

          return (
            <div
              key={domain}
              style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h2>
                #{index + 1} {domain.charAt(0).toUpperCase() + domain.slice(1)}: {percentageScore.toFixed(2)}%
              </h2>
              <h3>Level: {level}</h3>
              <p>{description}</p>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <h2>Total Score: {totalScore}%</h2>
        {progress !== null && (
          <p style={{ color: progress >= 0 ? 'green' : 'red' }}>
            {progress >= 0 ? '+' : ''}
            {progress.toFixed(2)}% since last test
          </p>
        )}
        <h3>Previous Test Dates:</h3>
        <ul>
          {previousResults.map((result, index) => (
            <li key={index}>
              {new Date(result.date).toLocaleString()} - Score: {result.totalScore.toFixed(2)}%
            </li>
          ))}
        </ul>
        <button
          onClick={handleRetakeTest}
          style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '1.2em', marginTop: '20px' }}
        >
          Retake Test
        </button>
      </div>
    </div>
  );
};

export default Results;

