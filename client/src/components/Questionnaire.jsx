// client/src/components/Questionnaire.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Questionnaire = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [responses, setResponses] = useState({});
  const [history, setHistory] = useState([]);
  const [timer, setTimer] = useState(30);
  const [showSubmit, setShowSubmit] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const maxHistory = 3;

  // Стили
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    minHeight: '100vh',
    justifyContent: showSubmit ? 'center' : 'flex-start',
    backgroundColor: '#f0f2f5',
  };

  const questionContainerStyle = {
    width: '80%',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const questionTextStyle = {
    fontSize: '1.8em',
    textAlign: 'center',
    margin: 0,
  };

  const labelsContainerStyle = {
    width: '80%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '1.2em',
  };

  const labelsStyle = {
    flex: '1',
    textAlign: 'center',
  };

  const optionsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '80%',
    marginBottom: '20px',
  };

  const optionButtonStyle = {
    width: '80px',
    height: '80px',
    margin: '0 10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.5em',
    color: '#fff',
    position: 'relative',
    transition: 'background-color 0.3s',
  };

  const checkmarkStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '1.5em',
    color: '#fff',
  };

  const navigationContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: '20px',
  };

  const navButtonStyle = {
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '1.2em',
    backgroundColor: '#76c7c0',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    opacity: 0.8,
    transition: 'opacity 0.3s',
    display: 'none', // Скрываем кнопку полностью
  };

  const submitButtonStyle = {
    padding: '15px 30px',
    borderRadius: '12px',
    fontSize: '1.2em',
    backgroundColor: '#2DCD7A',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s, box-shadow 0.3s',
  };

  const timerContainerStyle = {
    width: '80%',
    marginBottom: '20px',
    position: 'relative',
  };

  const timerBarBackgroundStyle = {
    height: '6px',
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden',
  };

  const timerBarForegroundStyle = {
    height: '100%',
    width: `${(timer / 30) * 100}%`,
    backgroundColor: '#76c7c0',
    borderRadius: '2px',
    transition: 'width 1s linear',
  };

  const timerTextStyle = {
    position: 'absolute',
    right: '10px',
    top: '-20px',
    fontSize: '16px',
  };

  const progressStyle = {
    marginTop: '20px',
    fontSize: '1.2em',
  };

  const completionContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f0f2f5',
  };

   // Загрузка и перемешивание вопросов при монтировании компонента
  useEffect(() => {
    import('../questions.json').then((module) => {
      const randomizedQuestions = module.default.sort(() => Math.random() - 0.5);
      setQuestions(randomizedQuestions);
      setQuestionQueue(randomizedQuestions.map((_, index) => index));
    });
  }, []);

  // Запуск таймера при изменении текущего вопроса
  useEffect(() => {
    if (showSubmit || questionQueue.length === 0) return;

    setTimer(30); // Сброс таймера на 30 секунд
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [questionQueue, showSubmit]);

  // Если таймер истёк, вызываем handleNext
  useEffect(() => {
    if (timer <= 0 && !showSubmit) {
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, showSubmit]);

  // Функция handleNext
  const handleNext = () => {
    console.log('handleNext called');
    clearInterval(intervalRef.current);

    if (questionQueue.length === 0) {
      console.log('Question queue is empty.');
      return;
    }

    const currentQuestionIndex = questionQueue[0];
    const currentQuestion = questions[currentQuestionIndex];
    console.log('Current Question:', currentQuestion);

    if (!responses[currentQuestion.id]) {
      console.log('Question not answered, moving to end of queue.');
      setQuestionQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        newQueue.push(newQueue.shift());
        console.log('New Queue after moving to end:', newQueue);
        return newQueue;
      });
    } else {
      console.log('Question answered, removing from queue and adding to history.');
      setQuestionQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        newQueue.shift();
        console.log('New Queue after removal:', newQueue);
        return newQueue;
      });
      setHistory((prevHistory) => {
        const newHistory = [...prevHistory, currentQuestionIndex];
        if (newHistory.length > maxHistory) newHistory.shift(); // Ограничение истории
        console.log('New History:', newHistory);
        return newHistory;
      });
    }

    // Проверка, все ли вопросы отвечены
    const allAnswered = questions.every((q) => responses[q.id]);
    console.log('All questions answered:', allAnswered);
    if (allAnswered) {
      console.log('All questions answered, showing submit.');
      setShowSubmit(true);
      clearInterval(intervalRef.current);
    }
  };

  // Обработчик выбора опции
  const handleOptionChange = (questionId, domain, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: { domain, value },
    }));

    // Переход к следующему вопросу через 0.3 секунды
    setTimeout(() => {
      handleNext();
    }, 300); // 0.3 секунды
  };

  // Обработчик перехода к предыдущему вопросу
  const handlePrevious = () => {
    console.log('handlePrevious called');
    if (history.length === 0) {
      console.log('No history to navigate back.');
      return;
    }

    clearInterval(intervalRef.current);
    const lastQuestionIndex = history[history.length - 1];
    console.log('Last Question Index from history:', lastQuestionIndex);
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, -1);
      console.log('Updated History after removal:', newHistory);
      return newHistory;
    });
    setQuestionQueue((prevQueue) => {
      const newQueue = [lastQuestionIndex, ...prevQueue];
      console.log('New Queue after navigating back:', newQueue);
      return newQueue;
    });
    setTimer(30); // Сброс таймера на 30 секунд
    setShowSubmit(false);
  };

  // Обработчик отправки результатов
  const handleSubmit = async () => {
    const responsesArray = questions.map((q) => ({
      questionId: q.id,
      domain: q.domain,
      value: responses[q.id]?.value || null,
    }));

    try {
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        await axios.post(
          '/api/submit-responses-auth',
          { responses: responsesArray },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        navigate('/results');
      } else {
        const res = await axios.post('/api/submit-responses', { responses: responsesArray });
        const tempId = res.data.tempId; // Предполагаем, что сервер возвращает tempId
        if (typeof tempId === 'string' && tempId.trim() !== '') {
          localStorage.setItem('tempId', tempId);
        } else {
          console.warn('Received tempId is not a valid string:', tempId);
          // Не устанавливаем tempId, чтобы избежать отправки пустой строки
        }
        navigate('/prompt-register');
      }
    } catch (err) {
      console.error('Error submitting responses:', err);
      alert('An error occurred while submitting your responses.');
    }
  };

  // Если вопросы ещё не загружены
  if (questions.length === 0) return null;

  // Если все вопросы отвечены и показана кнопка Submit
  if (showSubmit) {
    return (
      <div style={completionContainerStyle}>
        <h2>You have completed the test!</h2>
        <button onClick={handleSubmit} style={submitButtonStyle}>
          Submit
        </button>
      </div>
    );
  }

  // Получаем текущий вопрос из очереди
  const currentQuestionIndex = questionQueue[0];
  const currentQuestion = questions[currentQuestionIndex];

  // Защита от undefined
  if (!currentQuestion) {
    return null;
  }

  // Цвета для градиента кнопок
  const gradientColors = ['#2896E9', '#3F80E1', '#5569DA', '#6C53D3', '#7467F0'];

  // Форматирование таймера в MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Расчёт процента завершения
  const calculateProgress = () => {
    return ((Object.keys(responses).length / questions.length) * 100).toFixed(2);
  };

  return (
    <div style={containerStyle}>
      <h1>Strengths Assessment</h1>

      {/* Таймер */}
      <div style={timerContainerStyle}>
        <div style={timerBarBackgroundStyle}>
          <div style={timerBarForegroundStyle}></div>
        </div>
        <span style={timerTextStyle}>{formatTime(timer)}</span>
      </div>

      {/* Текст вопроса */}
      <div style={questionContainerStyle}>
        <p style={questionTextStyle}>{currentQuestion.text}</p>
      </div>

      {/* Метки "Absolutely Not" и "Absolutely Yes" */}
      <div style={labelsContainerStyle}>
        <span style={labelsStyle}>Absolutely Not</span>
        <span style={labelsStyle}>Absolutely Yes</span>
      </div>

      {/* Кнопки выбора */}
      <div style={optionsContainerStyle}>
        {[1, 2, 3, 4, 5].map((value, index) => (
          <button
            key={index}
            onClick={() =>
              handleOptionChange(currentQuestion.id, currentQuestion.domain, value)
            }
            style={{
              ...optionButtonStyle,
              background:
                responses[currentQuestion.id]?.value === value
                  ? '#2DCD7A'
                  : `linear-gradient(90deg, ${gradientColors[index]} 0%, ${gradientColors[index]} 100%)`,
            }}
          >
            {responses[currentQuestion.id]?.value === value && (
              <span style={checkmarkStyle}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Кнопки навигации */}
      <div style={navigationContainerStyle}>
        {/* Кнопка Previous */}
        <button
          type="button"
          onClick={handlePrevious}
          style={{
            ...navButtonStyle,
            display: history.length > 0 ? 'block' : 'none', // Показывать только при наличии истории
          }}
        >
          Previous
        </button>

        {/* Кнопка Next */}
        <button
          type="button"
          onClick={handleNext}
          style={{
            ...navButtonStyle,
            backgroundColor: '#2896E9',
            display: 'none', // Скрыть кнопку Next полностью
          }}
        >
          Next
        </button>
      </div>

      {/* Прогресс */}
      <div style={progressStyle}>
        {calculateProgress()}% Completed
      </div>
    </div>
  );
};

export default Questionnaire;