import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  School,
  Send,
  UserCheck,
  Loader2,
  RefreshCw,
  Mail,
  BookOpen,
  FileText,
  Brain,
  MessageSquare,
  HelpCircle,
  Eye,
  Download,
  X,
  ChevronRight
} from 'lucide-react';

const TeachersList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherNotes, setTeacherNotes] = useState([]);
  const [teacherQuizzes, setTeacherQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [notesLoading, setNotesLoading] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/connections/teachers');
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSendRequest = async (teacherId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [teacherId]: true }));
      await API.post('/connections', { teacherId });
      
      // Update local state status to pending
      setTeachers((prev) =>
        prev.map((t) =>
          t._id === teacherId ? { ...t, connectionStatus: 'pending' } : t
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [teacherId]: false }));
    }
  };

  const handleViewMaterials = async (teacher) => {
    try {
      setSelectedTeacher(teacher);
      setNotesLoading(true);
      setActiveTab('notes');
      const [notesRes, quizzesRes] = await Promise.all([
        API.get(`/notes?teacherId=${teacher._id}`),
        API.get(`/quizzes?teacherId=${teacher._id}`),
      ]);
      setTeacherNotes(notesRes.data);
      setTeacherQuizzes(quizzesRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to fetch teacher materials');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleDownload = (fileUrl, title) => {
    const backendUrl = API.defaults.baseURL.replace('/api', '');
    const link = document.createElement('a');
    link.href = `${backendUrl}${fileUrl}`;
    link.setAttribute('download', title);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Registered Teachers</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Connect with teachers to access their shared study guides and learning materials
          </p>
        </div>
        <button
          onClick={fetchTeachers}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center relative overflow-hidden"
            >
              <div className="flex flex-col items-center">
                {/* Profile Picture */}
                {teacher.profilePicture && !imageErrors[teacher._id] ? (
                  <img
                    src={`${API.defaults.baseURL.replace('/api', '')}${teacher.profilePicture}`}
                    alt={teacher.name}
                    className="w-18 h-18 rounded-full object-cover border-2 border-primary-100 dark:border-primary-950/40 shadow-sm"
                    onError={() => setImageErrors((prev) => ({ ...prev, [teacher._id]: true }))}
                  />
                ) : (
                  <div className="w-18 h-18 rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-500 dark:text-primary-400 flex items-center justify-center font-bold text-2xl border border-primary-100 dark:border-primary-900/30 shadow-sm">
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h3 className="font-bold text-slate-800 dark:text-white mt-4 text-base truncate max-w-[200px]">
                  {teacher.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1 block">
                  Course Faculty
                </span>

                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <Mail size={13} className="text-slate-400" />
                  <span className="truncate max-w-[180px]">{teacher.email}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full mt-6">
                {teacher.connectionStatus === 'none' && (
                  <button
                    onClick={() => handleSendRequest(teacher._id)}
                    disabled={actionLoading[teacher._id]}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading[teacher._id] ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        Send Request
                      </>
                    )}
                  </button>
                )}

                {teacher.connectionStatus === 'pending' && (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200/50 dark:border-darkBorder/40"
                  >
                    Pending
                  </button>
                )}

                {teacher.connectionStatus === 'accepted' && (
                  <div className="space-y-2 w-full">
                    <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 border border-emerald-100/30 dark:border-emerald-950/30">
                      <UserCheck size={14} />
                      Connected
                    </div>
                    <button
                      onClick={() => handleViewMaterials(teacher)}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <BookOpen size={14} />
                      View Materials
                    </button>
                  </div>
                )}

                {teacher.connectionStatus === 'rejected' && (
                  <button
                    onClick={() => handleSendRequest(teacher._id)}
                    disabled={actionLoading[teacher._id]}
                    className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-colors border border-rose-100/30 dark:border-rose-950/30 flex items-center justify-center gap-1.5"
                  >
                    {actionLoading[teacher._id] ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      'Resend Request'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {teachers.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white dark:bg-darkCard border border-dashed border-slate-200 dark:border-darkBorder rounded-3xl">
              <School size={40} className="text-slate-300 dark:text-darkBorder mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No registered teachers found.</p>
              <p className="text-slate-400/80 text-xs mt-1">Please ask your faculty to register on the platform.</p>
            </div>
          )}
        </div>
      )}

      {/* Teacher Materials Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl w-full max-w-4xl max-h-[85vh] p-6 shadow-2xl relative flex flex-col">
            <button
              onClick={() => {
                setSelectedTeacher(null);
                setTeacherNotes([]);
                setTeacherQuizzes([]);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              {selectedTeacher.profilePicture && !imageErrors[selectedTeacher._id] ? (
                <img
                  src={`${API.defaults.baseURL.replace('/api', '')}${selectedTeacher.profilePicture}`}
                  alt={selectedTeacher.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary-100 dark:border-primary-950/40 shadow-sm"
                  onError={() => setImageErrors((prev) => ({ ...prev, [selectedTeacher._id]: true }))}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-500 dark:text-primary-400 flex items-center justify-center font-bold text-xl border border-primary-100 dark:border-primary-900/30 shadow-sm">
                  {selectedTeacher.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Study Materials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Shared by {selectedTeacher.name} ({selectedTeacher.email})
                </p>
              </div>
            </div>

            <div className="flex border-b border-slate-100 dark:border-darkBorder mb-4">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'notes'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Study Materials
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'quizzes'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Practice Quizzes
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {notesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : activeTab === 'notes' ? (
                teacherNotes.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-sm">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-60 text-slate-300 dark:text-slate-600" />
                    No study materials uploaded by this teacher yet.
                  </div>
                ) : (
                  <div className="space-y-4 pr-1">
                    {teacherNotes.map((note) => (
                      <div
                        key={note._id}
                        className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-darkBorder rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                      >
                        <div className="flex items-start gap-3 text-left">
                          <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-500 mt-0.5">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                              {note.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-400">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* View Text preview */}
                          <button
                            onClick={() => setPreviewNote(note)}
                            className="p-1.5 text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                            title="Preview Parsed Content"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Generate Summary */}
                          <button
                            onClick={() => navigate(`/summaries?noteId=${note._id}`)}
                            className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                            title="AI Summarize"
                          >
                            <FileText size={15} />
                          </button>

                          {/* Generate Flashcards */}
                          <button
                            onClick={() => navigate(`/flashcards?noteId=${note._id}`)}
                            className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                            title="AI Flashcards"
                          >
                            <Brain size={15} />
                          </button>

                          {/* Generate Quiz */}
                          <button
                            onClick={() => navigate(`/quizzes?noteId=${note._id}`)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                            title="AI Practice Quiz"
                          >
                            <HelpCircle size={15} />
                          </button>

                          {/* Ask Assistant */}
                          <button
                            onClick={() => navigate(`/chat?noteId=${note._id}`)}
                            className="p-1.5 text-slate-400 hover:text-pink-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                            title="AI Doubt Solver"
                          >
                            <MessageSquare size={15} />
                          </button>

                          <div className="w-px h-4 bg-slate-200 dark:bg-darkBorder mx-1" />

                          {/* Download */}
                          <button
                            onClick={() => handleDownload(note.fileUrl, note.title)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                            title="Download Note File"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                teacherQuizzes.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-sm">
                    <HelpCircle size={40} className="mx-auto mb-3 opacity-60 text-slate-300 dark:text-slate-600" />
                    No quizzes created by this teacher yet.
                  </div>
                ) : (
                  <div className="space-y-4 pr-1">
                    {teacherQuizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-darkBorder rounded-2xl hover:border-slate-200 dark:hover:border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 text-left">
                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 mt-0.5">
                            <HelpCircle size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                              {quiz.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/50 text-[10px] font-semibold text-slate-500">
                                {quiz.difficulty}
                              </span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-400">
                                {quiz.maxScore} Questions
                              </span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(quiz.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => navigate(`/quizzes?quizId=${quiz._id}`)}
                            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            title="Take Teacher Quiz"
                          >
                            <span>Take Quiz</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl w-full max-w-3xl max-h-[80vh] p-6 shadow-2xl relative flex flex-col text-left">
            <button
              onClick={() => setPreviewNote(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1.5">
              <Eye size={18} className="text-primary-500" /> Parsed Text Preview
            </h3>
            <p className="text-xs text-slate-400 mb-4 truncate">
              File: {previewNote.title} ({new Date(previewNote.createdAt).toLocaleDateString()})
            </p>

            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-darkBorder p-5 rounded-2xl text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-wrap">
              {previewNote.extractedText || 'This note has no extractable text or is currently empty.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersList;
