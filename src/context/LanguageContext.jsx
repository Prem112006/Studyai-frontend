import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: 'Dashboard',
    subjects: 'Subjects',
    notes: 'Notes Upload',
    summaries: 'AI Summarizer',
    quizzes: 'AI Quizzes',
    flashcards: 'AI Flashcards',
    aiChat: 'AI Chat Assistant',
    progress: 'Progress Tracker',
    settings: 'Settings',
    leaderboard: 'Leaderboard',
    badges: 'Achievements',
    adminPanel: 'Admin Panel',
    logout: 'Logout',
    welcomeBack: 'Welcome Back',
    streak: 'Study Streak',
    xp: 'Total XP',
    notesUploaded: 'Notes Uploaded',
    summariesGenerated: 'Summaries Generated',
    quizzesTaken: 'Quizzes Taken',
    avgQuizScore: 'Avg Quiz Score',
    quickOverview: 'Quick Overview',
    flashcardsLearned: 'Flashcards Learned',
    uploadNewNotes: 'Upload New Notes',
    revisionPlanner: 'Revision Planner',
    voiceAssistant: 'Voice Assistant',
    favorites: 'Favorites Bookmarks',
    searchPlaceholder: 'Search notes, subjects, flashcards...',
    teachers: 'Teachers',
    requests: 'Student Requests',
  },
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');

  const t = (key) => {
    return translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
