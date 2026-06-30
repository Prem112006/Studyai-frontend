import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  Bookmark,
  CheckCircle,
  Eye,
  Brain,
  MessageSquare,
  HelpCircle,
  FolderOpen,
  Plus,
  Loader2,
  X
} from 'lucide-react';

const Notes = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isTeacher = user?.role === 'teacher';

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Preview Modal
  const [previewNote, setPreviewNote] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesRes, subjectsRes] = await Promise.all([
        API.get('/notes'),
        API.get('/subjects'),
      ]);
      setNotes(notesRes.data);
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0) {
        setSelectedSubjectId(subjectsRes.data[0]._id);
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = ['.pdf', '.docx', '.pptx', '.txt'];
      const extension = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (validExtensions.includes(extension)) {
        setFile(droppedFile);
        if (!title) {
          setTitle(droppedFile.name.substring(0, droppedFile.name.lastIndexOf('.')));
        }
      } else {
        alert('Unsupported file format. Please upload PDF, DOCX, PPTX, or TXT.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setUploadError('Please select a file and name it.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);

      const { data } = await API.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setNotes((prev) => [...prev, data]);
      setTitle('');
      setFile(null);
      alert(isTeacher ? 'Notes uploaded successfully!' : 'Notes uploaded and text contents parsed successfully!');
    } catch (err) {
      setUploadError(err.response?.data?.message || (isTeacher ? 'Failed to upload note.' : 'Failed to parse and upload note.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete these notes? This will delete the raw file.');
    if (!confirm) return;

    try {
      await API.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  const handleToggleBookmark = async (id) => {
    try {
      const { data } = await API.patch(`/notes/${id}/bookmark`);
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isBookmarked: data.isBookmarked } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (fileUrl, title) => {
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5001';
    const link = document.createElement('a');
    link.href = `${backendUrl}${fileUrl}`;
    link.setAttribute('download', title);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Notes Module</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          {isTeacher
            ? 'Upload and manage your course materials for students to access.'
            : 'Upload and review course documents to fuel summaries, practice assessments, and flashcards.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Pane */}
        <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm self-start space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UploadCloud size={18} className="text-primary-500" /> Upload Course Notes
          </h3>

          {uploadError && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
              {uploadError}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Drag & Drop */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative min-h-[160px] ${
                dragActive
                  ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/10'
                  : 'border-slate-200 dark:border-darkBorder hover:border-primary-500/60'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx,.pptx,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud size={32} className="text-slate-400 dark:text-slate-500 mb-2" />
              {file ? (
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & Drop notes here</p>
                  <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX, PPTX, TXT (Max 10MB)</p>
                </div>
              )}
            </div>

            {/* Note Title */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Note Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
                placeholder="e.g. Chapter 4 Scheduling Algorithms"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                isTeacher ? 'Upload' : 'Upload and Analyze'
              )}
            </button>
          </form>
        </div>

        {/* Notes list */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FolderOpen size={18} className="text-primary-500" /> Uploaded Notes
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {notes.map((note) => {
                const uploaderId = note.uploadedBy?._id || note.uploadedBy;
                const isMyNote = uploaderId === user?._id;
                const isTeacherNote = !isMyNote;
                return (
                  <div
                    key={note._id}
                    className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-darkBorder rounded-2xl hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-500 mt-0.5">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                            {note.title}
                          </h4>
                          {isTeacherNote && (
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-wider whitespace-nowrap">
                              Teacher Material
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-slate-400">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                          {isTeacherNote && (
                            <>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                                By {note.uploadedBy.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
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
                      {!isTeacher && (
                        <button
                          onClick={() => navigate(`/summaries?noteId=${note._id}`)}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                          title="AI Summarize"
                        >
                          <FileText size={15} />
                        </button>
                      )}

                      {/* Generate Flashcards */}
                      {!isTeacher && (
                        <button
                          onClick={() => navigate(`/flashcards?noteId=${note._id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                          title="AI Flashcards"
                        >
                          <Brain size={15} />
                        </button>
                      )}

                      {/* Generate Quiz */}
                      {!isTeacher && (
                        <button
                          onClick={() => navigate(`/quizzes?noteId=${note._id}`)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                          title="AI Practice Quiz"
                        >
                          <HelpCircle size={15} />
                        </button>
                      )}

                      {/* Ask Assistant */}
                      {!isTeacher && (
                        <button
                          onClick={() => navigate(`/chat?noteId=${note._id}`)}
                          className="p-1.5 text-slate-400 hover:text-pink-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                          title="AI Doubt Solver"
                        >
                          <MessageSquare size={15} />
                        </button>
                      )}

                      <div className="w-px h-4 bg-slate-200 dark:bg-darkBorder mx-1" />

                      {/* Download */}
                      <button
                        onClick={() => handleDownload(note.fileUrl, note.title)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                        title="Download Note File"
                      >
                        <Download size={15} />
                      </button>

                      {/* Bookmark Toggle */}
                      {!isTeacher && !isTeacherNote && (
                        <button
                          onClick={() => handleToggleBookmark(note._id)}
                          className={`p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-colors ${
                            note.isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                          }`}
                          title="Save Bookmark"
                        >
                          <Bookmark size={15} className={note.isBookmarked ? 'fill-amber-500' : ''} />
                        </button>
                      )}

                      {/* Delete */}
                      {!isTeacherNote && (
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                          title="Delete Notes"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {notes.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No notes uploaded yet. Drag a PDF or Word document in the panel to begin.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl w-full max-w-3xl max-h-[85vh] p-6 shadow-2xl relative flex flex-col">
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

export default Notes;
