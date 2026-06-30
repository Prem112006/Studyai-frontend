import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  FileText,
  HelpCircle,
  Brain,
  MessageSquare,
  TrendingUp,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  School,
  UserCheck
} from 'lucide-react';

import API from '../services/api';

const Sidebar = ({ isOpen, toggleSidebar, collapsed, setCollapsed }) => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { name: t('dashboard'), path: '/', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
    { name: t('notes'), path: '/notes', icon: UploadCloud, roles: ['student', 'teacher'] },
    { name: t('summaries'), path: '/summaries', icon: FileText, roles: ['student'] },
    { name: t('quizzes'), path: '/quizzes', icon: HelpCircle, roles: ['student', 'teacher'] },
    { name: t('flashcards'), path: '/flashcards', icon: Brain, roles: ['student'] },
    { name: t('aiChat'), path: '/chat', icon: MessageSquare, roles: ['student'] },
    { name: t('teachers'), path: '/teachers', icon: School, roles: ['student'] },
    { name: t('requests'), path: '/requests', icon: UserCheck, roles: ['teacher'] },
    { name: t('settings'), path: '/settings', icon: Settings, roles: ['student', 'teacher', 'admin'] },
  ];

  const userRole = user?.role || 'student';
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const activeStyle = 'bg-primary-600 text-white font-medium shadow-md shadow-primary-500/20';
  const inactiveStyle = 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-darkCard border-r border-slate-100 dark:border-darkBorder transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-darkBorder">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold text-lg">
              S
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent dark:from-primary-400">
                StudyAI
              </span>
            )}
          </div>
          
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full border border-slate-200 dark:border-darkBorder text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Close button (mobile only) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive ? activeStyle : inactiveStyle
                  }`
                }
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-darkBorder">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                {user?.profilePicture && !imageError ? (
                  <img
                    src={`${API.defaults.baseURL.replace('/api', '')}${user.profilePicture}`}
                    alt={user?.name || 'User'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-darkBorder"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm border border-primary-200 dark:border-primary-800">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t('logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {user?.profilePicture && !imageError ? (
                <img
                  src={`${API.defaults.baseURL.replace('/api', '')}${user.profilePicture}`}
                  alt="User"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-darkBorder"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm border border-primary-200 dark:border-primary-800">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t('logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
