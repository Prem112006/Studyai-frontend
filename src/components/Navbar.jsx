import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import {
  Sun,
  Moon,
  Bell,
  Menu,
  Search,
  CheckCircle,
  Zap,
  BookOpen,
  User as UserIcon
} from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { locale, setLocale, t } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch / compile notifications
  useEffect(() => {
    // Start with default simulated notifications, then try to fetch
    const defaultNotifs = [
      {
        id: '1',
        title: 'Daily Quiz Ready',
        message: 'Your AI Quiz for OS Scheduling is generated. Test yourself!',
        type: 'quiz',
        read: false,
        time: '5m ago'
      },
      {
        id: '2',
        title: 'Streak Active!',
        message: 'Keep it up! You are on a study streak.',
        type: 'streak',
        read: false,
        time: '1h ago'
      },
      {
        id: '3',
        title: 'AI Recommendation',
        message: 'Review Flashcards for Computer Networks before bedtime.',
        type: 'ai',
        read: true,
        time: '5h ago'
      }
    ];

    setNotifications(defaultNotifs);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'quiz':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'streak':
        return <Zap size={16} className="text-amber-500" />;
      case 'ai':
        return <BookOpen size={16} className="text-primary-500" />;
      default:
        return <Bell size={16} className="text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-darkBg/80 backdrop-blur-md border-b border-slate-100 dark:border-darkBorder">
      {/* Mobile Toggle & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="lg:hidden font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent dark:from-primary-400">
          StudyAI
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 ml-auto">


        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60"
          title="Toggle Theme"
        >
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowLanguages(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-darkBg" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-slate-800/30">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-darkBorder max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 flex gap-3 transition-colors ${
                        item.read ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">{getNotifIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${item.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge indicator (Streak & XP) */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-darkBorder">
          <div className="flex items-center gap-1.5" title="XP Points">
            <Zap size={14} className="text-amber-500 fill-amber-500 animate-pulse-slow" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {user?.xp || 0} XP
            </span>
          </div>
          <div className="w-px h-3.5 bg-slate-200 dark:bg-darkBorder" />
          <div className="flex items-center gap-1.5" title="Streak Days">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">🔥 {user?.streak || 0}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
