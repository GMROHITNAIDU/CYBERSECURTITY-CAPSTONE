import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Target,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import './Assessment.css';

const Assessment = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [module, setModule] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    fetchModuleAndAssessment();
  }, [moduleId]);

  useEffect(() => {
    let timer;
    if (timeRemaining > 0 && !isSubmitted) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !isSubmitted) {
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [timeRemaining, isSubmitted]);

  const fetchModuleAndAssessment = async () => {
    try {
      setLoading(true);
      
      // Fetch module details
      const moduleResponse = await axios.get(`/modules/${moduleId}`);
      setModule(moduleResponse.data);
      
      // Start or get existing assessment
      const assessmentResponse = await axios.post(`/assessments/${moduleId}`);
      const assessmentData = assessmentResponse.data;
      
      setAssessment(assessmentData);
      
      // Set timer (assume 30 seconds per question)
      const totalTime = assessmentData.questions.length * 30;
      setTimeRemaining(totalTime);
      
      // If assessment is already completed, show results
      if (assessmentData.status === 'completed') {
        setIsSubmitted(true);
        setShowResults(true);
        setScore(assessmentData.score);
        setAnswers(assessmentData.answers);
      }
      
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast.error('Failed to load assessment');
      navigate('/training');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const response = await axios.post(`/assessments/${assessment.id}/submit`, {
        answers: answers
      });
      
      setScore(response.data.score);
      setIsSubmitted(true);
      setShowResults(true);
      
      const scoreMessage = response.data.score >= 70 
        ? `Great job! You scored ${response.data.score}%` 
        : `You scored ${response.data.score}%. Consider reviewing the material.`;
      
      toast.success(scoreMessage);
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'pass';
    return 'fail';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent! You have mastered this topic.';
    if (score >= 80) return 'Great job! You have a solid understanding.';
    if (score >= 70) return 'Good work! You passed the assessment.';
    return 'Keep learning! Review the material and try again.';
  };

  const handleRetakeAssessment = () => {
    // Reset state for retake
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setShowResults(false);
    setScore(null);
    
    // Start a new assessment
    fetchModuleAndAssessment();
  };

  if (loading) {
    return (
      <div className="assessment-loading">
        <div className="loading-spinner"></div>
        <p>Loading assessment...</p>
      </div>
    );
  }

  if (!module || !assessment) {
    return (
      <div className="assessment-error">
        <AlertCircle size={48} />
        <h2>Assessment not found</h2>
        <p>The requested assessment could not be loaded.</p>
        <button onClick={() => navigate('/training')} className="btn-primary">
          Back to Training
        </button>
      </div>
    );
  }

  // Results View
  if (showResults) {
    return (
      <div className="assessment-page results-view" data-testid="assessment-results">
        <div className="assessment-container">
          <div className="results-header">
            <button 
              onClick={() => navigate('/training')}
              className="back-btn"
              data-testid="back-to-training-btn"
            >
              <ArrowLeft size={16} />
              Back to Training
            </button>
            
            <div className="module-info">
              <h1 className="module-title">{module.title}</h1>
              <p className="module-description">Assessment Results</p>
            </div>
          </div>

          <div className="results-content">
            <div className={`score-display ${getScoreColor(score)}`}>
              <div className="score-icon">
                {score >= 70 ? <Trophy size={48} /> : <Target size={48} />}
              </div>
              <div className="score-text">
                <div className="score-number">{Math.round(score)}%</div>
                <div className="score-label">Your Score</div>
              </div>
            </div>

            <div className="score-message">
              <p>{getScoreMessage(score)}</p>
            </div>

            <div className="results-summary">
              <div className="summary-item">
                <span className="summary-label">Questions Answered:</span>
                <span className="summary-value">{Object.keys(answers).length} / {assessment.questions.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Correct Answers:</span>
                <span className="summary-value">
                  {assessment.questions.filter(q => answers[q.id] === q.correct_answer).length}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Status:</span>
                <span className={`summary-value status ${score >= 70 ? 'passed' : 'failed'}`}>
                  {score >= 70 ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>

            <div className="results-actions">
              <button 
                onClick={handleRetakeAssessment}
                className="btn-secondary"
                data-testid="retake-assessment-btn"
              >
                <RotateCcw size={16} />
                Retake Assessment
              </button>
              
              <button 
                onClick={() => navigate('/training')}
                className="btn-primary"
                data-testid="continue-learning-btn"
              >
                Continue Learning
              </button>
            </div>

            {/* Question Review */}
            <div className="question-review">
              <h3>Question Review</h3>
              <div className="review-list">
                {assessment.questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correct_answer;
                  
                  return (
                    <div 
                      key={question.id} 
                      className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}
                    >
                      <div className="review-header">
                        <div className="question-number">Q{index + 1}</div>
                        <div className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                          {isCorrect ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                      </div>
                      
                      <div className="review-content">
                        <div className="question-text">{question.text}</div>
                        <div className="answer-comparison">
                          <div className="user-answer">
                            <strong>Your answer:</strong> {userAnswer || 'Not answered'}
                          </div>
                          {!isCorrect && (
                            <div className="correct-answer">
                              <strong>Correct answer:</strong> {question.correct_answer}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  const allQuestionsAnswered = assessment.questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="assessment-page" data-testid="assessment-page">
      <div className="assessment-container">
        {/* Header */}
        <div className="assessment-header">
          <button 
            onClick={() => navigate('/training')}
            className="back-btn"
            data-testid="back-btn"
          >
            <ArrowLeft size={16} />
            Back to Training
          </button>
          
          <div className="module-info">
            <h1 className="module-title">{module.title}</h1>
            <p className="module-description">Assessment</p>
          </div>

          <div className="timer">
            <Clock size={16} />
            <span className={timeRemaining <= 60 ? 'urgent' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-section">
          <div className="progress-info">
            <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="question-section">
          <div className="question-card">
            <div className="question-header">
              <span className="question-type">
                {currentQuestion.type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'}
              </span>
            </div>
            
            <div className="question-content">
              <h2 className="question-text">{currentQuestion.text}</h2>
              
              <div className="answer-options">
                {currentQuestion.type === 'multiple_choice' ? (
                  currentQuestion.options.map((option, index) => (
                    <label 
                      key={index} 
                      className={`option-label ${answers[currentQuestion.id] === option ? 'selected' : ''}`}
                      data-testid={`option-${index}`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                        className="option-input"
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))
                ) : (
                  <>
                    <label 
                      className={`option-label ${answers[currentQuestion.id] === true ? 'selected' : ''}`}
                      data-testid="true-option"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={true}
                        checked={answers[currentQuestion.id] === true}
                        onChange={() => handleAnswerSelect(currentQuestion.id, true)}
                        className="option-input"
                      />
                      <span className="option-text">True</span>
                    </label>
                    
                    <label 
                      className={`option-label ${answers[currentQuestion.id] === false ? 'selected' : ''}`}
                      data-testid="false-option"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={false}
                        checked={answers[currentQuestion.id] === false}
                        onChange={() => handleAnswerSelect(currentQuestion.id, false)}
                        className="option-input"
                      />
                      <span className="option-text">False</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation-section">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="nav-btn prev-btn"
            data-testid="prev-question-btn"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <div className="question-indicators">
            {assessment.questions.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentQuestionIndex ? 'current' : ''} ${
                  answers[assessment.questions[index].id] ? 'answered' : ''
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
                data-testid={`question-indicator-${index}`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !allQuestionsAnswered}
              className="submit-btn"
              data-testid="submit-assessment-btn"
            >
              {submitting ? (
                <>
                  <div className="loading-spinner small" />
                  Submitting...
                </>
              ) : (
                'Submit Assessment'
              )}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="nav-btn next-btn"
              data-testid="next-question-btn"
            >
              Next
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Submit Warning */}
        {!allQuestionsAnswered && (
          <div className="submit-warning">
            <AlertCircle size={16} />
            <span>Please answer all questions before submitting</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;