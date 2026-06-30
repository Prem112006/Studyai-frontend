import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import {
  UploadCloud,
  HelpCircle,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [requests, setRequests] = useState({ pendingRequests: [], connectedStudents: [] });
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesRes, quizzesRes, requestsRes] = await Promise.all([
        API.get('/notes'),
        API.get('/quizzes'),
        API.get('/connections/requests'),
      ]);
      setNotes(notesRes.data || []);
      setQuizzes(quizzesRes.data || []);
      setRequests(requestsRes.data || { pendingRequests: [], connectedStudents: [] });
    } catch (error) {
      console.error('Failed to load teacher dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnectionAction = async (connectionId, status) => {
    try {
      setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
      await API.patch(`/connections/${connectionId}`, { status });
      // Refresh requests listing and stats
      const requestsRes = await API.get('/connections/requests');
      setRequests(requestsRes.data || { pendingRequests: [], connectedStudents: [] });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update connection status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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
            Manage your classes, review pending student requests, and generate study materials.
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
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Notes Uploaded</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1">{notes.length}</p>
          </div>
        </div>

        {/* Quizzes generated */}
        <div className="p-5 md:p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <HelpCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Quiz Generated</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1">{quizzes.length}</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="p-5 md:p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Pending Requests</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1">{requests.pendingRequests.length}</p>
          </div>
        </div>

        {/* Connected Students */}
        <div className="p-5 md:p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Connected Students</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1">{requests.connectedStudents.length}</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Connection Requests Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
              <UserCheck size={20} className="text-primary-500" />
              Pending Student Requests
            </h3>
            {requests.pendingRequests.length > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {requests.pendingRequests.length} pending
              </span>
            )}
          </div>

          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm">
            {requests.pendingRequests.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No pending requests</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">When students request to connect with you, they will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-darkBorder max-h-[350px] overflow-y-auto pr-2">
                {requests.pendingRequests.map((req) => (
                  <div key={req._id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                        {req.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{req.student.name}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{req.student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConnectionAction(req._id, 'accepted')}
                        disabled={actionLoading[req._id]}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-500/10 hover:shadow-md transition-all disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleConnectionAction(req._id, 'rejected')}
                        disabled={actionLoading[req._id]}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Uploaded Notes Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
              <FileText size={20} className="text-primary-500" />
              Recent Uploads
            </h3>
            <Link to="/notes" className="text-xs text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-0.5">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm">
            {notes.length === 0 ? (
              <div className="py-8 text-center">
                <UploadCloud className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No uploads yet</p>
                <Link to="/notes" className="text-primary-500 hover:underline text-xs mt-1 inline-block">
                  Upload your first note
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {notes.slice(0, 5).map((note) => (
                  <div key={note._id} className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-darkBorder/40">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate" title={note.title}>
                        {note.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    {note.fileUrl && (
                      <a
                        href={note.fileUrl.startsWith('http') ? note.fileUrl : `${API.defaults.baseURL.replace('/api', '')}${note.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-100 dark:border-darkBorder transition-all flex-shrink-0"
                        title="Open File"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
