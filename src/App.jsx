import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Summaries from './pages/Summaries';
import Quizzes from './pages/Quizzes';
import Flashcards from './pages/Flashcards';
import AIChat from './pages/AIChat';
import Settings from './pages/Settings';
import TeachersList from './pages/TeachersList';
import TeacherRequests from './pages/TeacherRequests';
import ResetPassword from './pages/ResetPassword';

// Guard: Require Authentication
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-darkBg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Guard: Require Admin Role
const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-darkBg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated && user?.role === 'admin' ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};

// Guard: Require Specific Role(s)
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-darkBg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.includes(user?.role)) {
    return children;
  }

  return <Navigate to="/" replace />;
};

// Layout for Protected Pages
const ProtectedLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-200">
      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Private Routes wrapped in ProtectedLayout */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['student', 'teacher', 'admin']}>
                      <ProtectedLayout>
                        <Dashboard />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/notes"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['student', 'teacher']}>
                      <ProtectedLayout>
                        <Notes />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/summaries"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['student']}>
                      <ProtectedLayout>
                        <Summaries />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['student', 'teacher']}>
                      <ProtectedLayout>
                        <Quizzes />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/flashcards"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['student']}>
                      <ProtectedLayout>
                        <Flashcards />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['student']}>
                      <ProtectedLayout>
                        <AIChat />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['student', 'teacher', 'admin']}>
                      <ProtectedLayout>
                        <Settings />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teachers"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['student']}>
                      <ProtectedLayout>
                        <TeachersList />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/requests"
                element={
                  <PrivateRoute>
                    <RoleRoute allowedRoles={['teacher']}>
                      <ProtectedLayout>
                        <TeacherRequests />
                      </ProtectedLayout>
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
