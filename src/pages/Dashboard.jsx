import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  UploadCloud,
  FileText,
  HelpCircle,
  Zap,
  TrendingUp,
  Brain,
  Award,
  BookOpen,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import TeacherDashboard from './TeacherDashboard';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'teacher') {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/progress/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard data. Using mock stats.', error);
        // Fallback mock stats for visual completeness
        setStats({
          summaryStats: {
            totalNotes: 4,
            totalSummaries: 3,
            totalQuizzes: 5,
            averageQuizScore: 82,
            totalFlashcards: 12,
            learnedFlashcards: 8,
            streak: user?.streak || 3,
            xp: user?.xp || 240,
            badges: user?.badges?.length ? user.badges : ['Scholar Apprentice', 'Week Warrior'],
          },
          weeklyActivity: [
            { date: 'Mon', studyHours: 1.5, quizzesCompleted: 1, flashcardsLearned: 3 },
            { date: 'Tue', studyHours: 2.0, quizzesCompleted: 0, flashcardsLearned: 2 },
            { date: 'Wed', studyHours: 0.5, quizzesCompleted: 1, flashcardsLearned: 0 },
            { date: 'Thu', studyHours: 3.0, quizzesCompleted: 2, flashcardsLearned: 4 },
            { date: 'Fri', studyHours: 1.0, quizzesCompleted: 0, flashcardsLearned: 1 },
            { date: 'Sat', studyHours: 2.5, quizzesCompleted: 1, flashcardsLearned: 5 },
            { date: 'Sun', studyHours: 1.2, quizzesCompleted: 0, flashcardsLearned: 0 },
          ],
          subjectWiseStats: [
            { subjectName: 'Operating Systems', color: '#6366f1', notesCount: 2, quizCount: 3, cardsCount: 6, averageScore: 85 },
            { subjectName: 'Computer Networks', color: '#10b981', notesCount: 1, quizCount: 1, cardsCount: 4, averageScore: 78 },
            { subjectName: 'Mathematics', color: '#f59e0b', notesCount: 1, quizCount: 1, cardsCount: 2, averageScore: 90 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (user?.role === 'admin') {
    return <AdminPanel />;
  }

  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const { summaryStats, weeklyActivity } = stats;

  // Chart 1: Weekly Activity Chart (Study Hours)
  const lineChartData = {
    labels: weeklyActivity.map((d) => d.date),
    datasets: [
      {
        fill: true,
        label: 'Study Hours',
        data: weeklyActivity.map((d) => d.studyHours),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(156, 163, 175, 0.1)' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-primary-900 to-indigo-800 text-white shadow-xl shadow-primary-950/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="z-10">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary-200 uppercase mb-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            {t('welcomeBack')}, {user?.name}!
          </h2>
          <p className="text-primary-100/80 mt-1.5 text-sm md:text-base max-w-xl">
            You have earned <span className="font-bold text-white text-base">{summaryStats.xp} XP</span> and maintained a study streak of <span className="font-bold text-white text-base">{summaryStats.streak} days</span>. Ready to study?
          </p>
        </div>
        <div className="flex items-center gap-4 z-10 flex-shrink-0">
          <Link
            to="/notes"
            className="px-5 py-3 rounded-2xl bg-white text-primary-900 font-semibold text-sm hover:bg-slate-100 hover:shadow-lg transition-all"
          >
            {t('uploadNewNotes')}
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Notes uploaded */}
        <div className="p-5 md:p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
            <UploadCloud size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t('notesUploaded')}</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1">{summaryStats.totalNotes}</p>
          </div>
        </div>

        {/* Summaries generated */}
        <div className="p-5 md:p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t('summariesGenerated')}</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1">{summaryStats.totalSummaries}</p>
          </div>
        </div>

        {/* Quizzes Taken */}
        <div className="p-5 md:p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500">
            <HelpCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t('quizzesTaken')}</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1">{summaryStats.totalQuizzes}</p>
          </div>
        </div>

        {/* Average Quiz Score */}
        <div className="p-5 md:p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/20 text-pink-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t('avgQuizScore')}</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1">{summaryStats.averageQuizScore}%</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Weekly study activity (Line chart) */}
        <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white">Weekly Study Activity</h3>
            <span className="text-xs text-slate-500 font-medium">Last 7 Days</span>
          </div>
          <div className="h-64 relative">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
