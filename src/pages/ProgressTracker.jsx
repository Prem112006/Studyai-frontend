import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  Sparkles,
  Loader2,
  Clock,
} from 'lucide-react';

const ProgressTracker = () => {
  const { refreshStats } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Manual Log States
  const [manualHours, setManualHours] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // Planner States
  const [examDate, setExamDate] = useState('');
  const [subjectsInput, setSubjectsInput] = useState('');
  const [studyHoursPerDay, setStudyHoursPerDay] = useState('3');
  const [isPlanning, setIsPlanning] = useState(false);
  const [revisionPlan, setRevisionPlan] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/progress/dashboard');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!manualHours || parseFloat(manualHours) <= 0) return;

    try {
      setIsLogging(true);
      await API.post('/progress', {
        studyHours: parseFloat(manualHours),
        quizzesCompleted: 0,
        flashcardsLearned: 0,
      });
      setManualHours('');
      alert('Study hours logged successfully. XP awarded!');
      await refreshStats();
      // Reload stats
      const statsRes = await API.get('/progress/dashboard');
      setStats(statsRes.data);
    } catch (err) {
      alert('Failed to log study hours');
    } finally {
      setIsLogging(false);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    const subjectsArray = subjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!examDate || subjectsArray.length === 0) {
      alert('Please enter at least one subject and select your exam date.');
      return;
    }

    try {
      setIsPlanning(true);
      const { data } = await API.post('/progress/revision-planner', {
        examDate,
        subjects: subjectsArray,
        studyHoursPerDay: parseFloat(studyHoursPerDay),
      });
      setRevisionPlan(data);
    } catch (err) {
      alert('Failed to generate revision schedule');
    } finally {
      setIsPlanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Progress & Revision</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Track study logs and schedule AI revisions
        </p>
      </div>

      {/* Manual Log Card */}
      <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={18} className="text-primary-500" /> Log Study Time
        </h3>
        <form onSubmit={handleLogActivity} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Study Hours Spent
            </label>
            <input
              type="number"
              step="0.5"
              value={manualHours}
              onChange={(e) => setManualHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
              placeholder="e.g. 1.5"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLogging}
            className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-40"
          >
            {isLogging ? 'Logging...' : 'Log Time'}
          </button>
        </form>
      </div>

      {/* AI Revision Planner Form */}
      <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-5">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Sparkles size={18} className="text-primary-500 animate-pulse-slow" /> Smart Revision Planner
        </h3>
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exam Date */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-705 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            </div>

            {/* Hours Per day */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Daily Study Hours Target
              </label>
              <select
                value={studyHoursPerDay}
                onChange={(e) => setStudyHoursPerDay(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-700 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5+ hours</option>
              </select>
            </div>
          </div>

          {/* Subjects Input Field */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Enter subjects for this exam (separated by commas)
            </label>
            <input
              type="text"
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs font-semibold"
              placeholder="e.g. Mathematics, Computer Networks, Operating Systems"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPlanning || !subjectsInput.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isPlanning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Generate AI Timetable'
            )}
          </button>
        </form>
      </div>

      {/* Timetable schedule output */}
      {revisionPlan && (
        <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar size={18} className="text-primary-500" /> Personalized Daily Revision timetable
          </h3>
          <div className="space-y-4">
            {revisionPlan.map((day, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-darkBorder rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Day {idx + 1}: {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/20 text-[9px] font-bold uppercase text-primary-600 dark:text-primary-400">
                      {day.focusSubject}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {day.tasks.map((task, i) => (
                      <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-slate-400" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg self-start">
                  <Clock size={12} /> {day.hours}h
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
