import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Users, UserCheck, UserX, Loader2, RefreshCw, Mail } from 'lucide-react';

const TeacherRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/connections/requests');
      setPendingRequests(data.pendingRequests);
      setConnectedStudents(data.connectedStudents);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (connectionId, status) => {
    try {
      setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
      await API.patch(`/connections/${connectionId}`, { status });
      
      // Refresh requests listing
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update connection status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Student Connections</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Accept student requests to grant them read access to your uploaded study materials
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-500 dark:text-slate-400 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Refresh List"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Incoming Requests Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-base">
              <Users size={18} className="text-primary-500" />
              Incoming Requests ({pendingRequests.length})
            </h3>

            <div className="space-y-4 pr-1 max-h-[500px] overflow-y-auto">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-4 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    {req.student?.profilePicture && !imageErrors[req.student._id] ? (
                      <img
                        src={`${API.defaults.baseURL.replace('/api', '')}${req.student.profilePicture}`}
                        alt={req.student.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200/50"
                        onError={() => setImageErrors((prev) => ({ ...prev, [req.student._id]: true }))}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-100/30">
                        {req.student?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                        {req.student?.name}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail size={12} />
                        {req.student?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'accepted')}
                      disabled={actionLoading[req._id]}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
                    >
                      {actionLoading[req._id] ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          <UserCheck size={14} />
                          Accept
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'rejected')}
                      disabled={actionLoading[req._id]}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      {actionLoading[req._id] ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          <UserX size={14} />
                          Decline
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && (
                <div className="py-12 text-center bg-white dark:bg-darkCard border border-dashed border-slate-200 dark:border-darkBorder rounded-3xl text-xs text-slate-400">
                  No pending connection requests.
                </div>
              )}
            </div>
          </div>

          {/* Connected Students List Column */}
          <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm self-start space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-base">
              <UserCheck size={18} className="text-emerald-500" />
              Connected Students ({connectedStudents.length})
            </h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {connectedStudents.map((conn) => (
                <div
                  key={conn._id}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
                >
                  {conn.student?.profilePicture && !imageErrors[conn.student._id] ? (
                    <img
                      src={`${API.defaults.baseURL.replace('/api', '')}${conn.student.profilePicture}`}
                      alt={conn.student.name}
                      className="w-9 h-9 rounded-full object-cover"
                      onError={() => setImageErrors((prev) => ({ ...prev, [conn.student._id]: true }))}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm">
                      {conn.student?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">
                      {conn.student?.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {conn.student?.email}
                    </p>
                  </div>
                </div>
              ))}

              {connectedStudents.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No connected students yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherRequests;
