import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import confetti from 'canvas-confetti';
import { AuthContext } from '../context/AuthContext';
import {
  HelpCircle,
  Timer,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Loader2,
  Bookmark,
  Calendar,
  Trash2
} from 'lucide-react';

const Quizzes = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlNoteId = queryParams.get('noteId');
  const urlQuizId = queryParams.get('quizId');

  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz Setup states
  const [selectedNoteId, setSelectedNoteId] = useState(urlNoteId || '');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz taking states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // mapped as { questionIndex: answerText }
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerIntervalId, setTimerIntervalId] = useState(null);
  
  // Results view states
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [submittingResult, setSubmittingResult] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesRes, quizzesRes] = await Promise.all([
        API.get('/notes'),
        API.get('/quizzes'),
      ]);
      setNotes(notesRes.data);
      setQuizzes(quizzesRes.data);
      if (notesRes.data.length > 0 && !selectedNoteId) {
        setSelectedNoteId(notesRes.data[0]._id);
      }

      if (urlQuizId) {
        const { data } = await API.get(`/quizzes/${urlQuizId}`);
        setActiveQuiz(data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setTimerSeconds(data.questions.length * 30);
        setShowResults(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer effect
  useEffect(() => {
    if (activeQuiz && !showResults) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeQuiz, showResults]);

  const handleGenerateQuiz = async () => {
    if (!selectedNoteId) return;

    const questionCount = parseInt(count);
    if (isNaN(questionCount) || questionCount < 1 || questionCount > 50) {
      alert('Please enter a valid number of questions between 1 and 50.');
      return;
    }

    try {
      setIsGenerating(true);
      const { data } = await API.post('/quizzes', {
        noteId: selectedNoteId,
        difficulty,
        count: parseInt(count),
      });
      // Start the Quiz
      setActiveQuiz(data);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTimerSeconds(data.questions.length * 30); // 30s per question
      setShowResults(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }
    try {
      await API.delete(`/quizzes/${quizId}`);
      // Refresh quizzes list
      const { data } = await API.get('/quizzes');
      setQuizzes(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const handleSelectAnswer = (optionText) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionText,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateScoreLocally = () => {
    let finalScore = 0;
    activeQuiz.questions.forEach((q, idx) => {
      const userAnswer = selectedAnswers[idx] || '';
      if (userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        finalScore++;
      }
    });
    return finalScore;
  };

  const handleAutoSubmitQuiz = () => {
    alert('Time limit reached! Submitting your answers automatically.');
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    const finalScore = calculateScoreLocally();
    setScore(finalScore);
    setShowResults(true);

    try {
      setSubmittingResult(true);
      await API.post(`/quizzes/${activeQuiz._id}/submit`, { score: finalScore });
      
      // Fire confetti celebration if user scores > 75%
      const percentage = (finalScore / activeQuiz.questions.length) * 100;
      if (percentage >= 75) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      // Refresh listing
      const { data } = await API.get('/quizzes');
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to submit results to database', err);
    } finally {
      setSubmittingResult(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleCloseActiveQuiz = () => {
    setActiveQuiz(null);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Quizzes</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Generate structured assessments from course documents to evaluate retention
        </p>
      </div>

      {activeQuiz ? (
        /* Quiz interface view */
        <div className="max-w-3xl mx-auto bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-lg overflow-hidden">
          {/* Header toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-md">
                {activeQuiz.title}
              </h3>
              <p className="text-[10px] uppercase font-bold text-primary-500 mt-0.5">
                Difficulty: {activeQuiz.difficulty}
              </p>
            </div>
            
            {!showResults && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
                <Timer size={16} />
                <span className="text-xs font-bold font-mono">{formatTime(timerSeconds)}</span>
              </div>
            )}
          </div>

          {!showResults ? (
            /* active question interface */
            <div className="p-6 md:p-8 space-y-6">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
                  <span>{Math.round(((currentQuestionIndex) / activeQuiz.questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="bg-slate-50/50 dark:bg-slate-800/10 p-5 rounded-2xl border border-slate-100 dark:border-darkBorder">
                <p className="font-bold text-slate-800 dark:text-white leading-relaxed">
                  {activeQuiz.questions[currentQuestionIndex].questionText}
                </p>
              </div>

              {/* Input field or Options selection */}
              {activeQuiz.questions[currentQuestionIndex].questionType === 'fill-in-the-blank' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Your Answer
                  </label>
                  <input
                    type="text"
                    value={selectedAnswers[currentQuestionIndex] || ''}
                    onChange={(e) => handleSelectAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    placeholder="Type your fill-in-the-blank answer..."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      className={`p-4 text-left text-sm font-semibold rounded-2xl border transition-all ${
                        selectedAnswers[currentQuestionIndex] === option
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'border-slate-200 dark:border-darkBorder text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-darkBorder">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 border border-slate-200 dark:border-darkBorder rounded-xl text-slate-500 disabled:opacity-50 text-xs font-semibold"
                >
                  Previous
                </button>

                {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md"
                  >
                    Finish and Submit
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results & Review view */
            <div className="p-6 md:p-8 space-y-6">
              {/* Score breakdown */}
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-darkBorder rounded-3xl max-w-md mx-auto space-y-3">
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Your Score</h4>
                <p className="text-5xl font-black text-primary-600 dark:text-primary-400">
                  {score} / {activeQuiz.maxScore}
                </p>
                <p className="text-xs text-slate-500">
                  {Math.round((score / activeQuiz.maxScore) * 100)}% Accuracy
                </p>
                {Math.round((score / activeQuiz.maxScore) * 100) >= 80 ? (
                  <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 text-[10px] font-bold uppercase rounded-full">
                    Excellent Job! 🥳
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 text-[10px] font-bold uppercase rounded-full">
                    Keep Practicing! 👍
                  </span>
                )}
              </div>

              {/* Review section */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Review Questions</h4>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {activeQuiz.questions.map((q, idx) => {
                    const userAnswer = selectedAnswers[idx] || 'No answer provided';
                    const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${
                          isCorrect
                            ? 'border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/10'
                            : 'border-rose-100 dark:border-rose-950/40 bg-rose-50/10'
                        }`}
                      >
                        <p className="font-bold text-xs text-slate-800 dark:text-white leading-relaxed">
                          Q{idx + 1}: {q.questionText}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                          <p className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Your Answer</span>
                            {userAnswer}
                          </p>
                          <p className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
                            <span className="font-bold text-[10px] uppercase text-emerald-500 block mb-1">Correct Answer</span>
                            {q.answer}
                          </p>
                        </div>

                        {q.explanation && (
                          <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-[11px] text-slate-500 leading-relaxed border-l-2 border-primary-500">
                            <span className="font-bold text-[9px] uppercase text-primary-500 block mb-0.5">Explanation</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close results panel button */}
              <div className="text-center pt-4 border-t border-slate-100 dark:border-darkBorder">
                <button
                  onClick={handleCloseActiveQuiz}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Setup / listing view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Generator controls */}
          <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm self-start space-y-5">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-primary-500 animate-pulse-slow" /> Generate practice Quiz
            </h3>

            <div className="space-y-4">
              {/* Note Selection */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Select Study Material
                </label>
                {notes.length > 0 ? (
                  <select
                    value={selectedNoteId}
                    onChange={(e) => setSelectedNoteId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {notes.map((n) => (
                      <option key={n._id} value={n._id}>
                        {n.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600">Please upload a notes file first to generate a quiz.</p>
                )}
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                        difficulty === d
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                          : 'border-slate-200 dark:border-darkBorder text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Length */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="e.g. 5"
                  required
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || notes.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Generate AI Quiz'
                )}
              </button>
            </div>
          </div>

          {/* Past completed Quizzes List */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle size={18} className="text-primary-500" /> Completed Quizzes
            </h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-darkBorder rounded-2xl flex items-center justify-between gap-4 hover:border-slate-200 transition-all"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                      {quiz.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/50">
                        {quiz.difficulty}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(quiz.completedAt || quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-base font-black text-primary-600 dark:text-primary-400">
                        {quiz.score} / {quiz.maxScore}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        {quiz.isCompleted ? 'Completed' : 'Draft'}
                      </span>
                    </div>

                    {(user?.role === 'teacher' || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                        title="Delete Quiz"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {quizzes.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No quizzes completed yet. Generate a practice quiz on the left panel to test yourself.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
