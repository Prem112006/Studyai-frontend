import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { BookOpen, Landmark, Atom, Cpu, Binary, Calculator, Globe, Palette, Trash2, Plus, X, Loader2 } from 'lucide-react';

const iconsMap = {
  BookOpen: BookOpen,
  Landmark: Landmark,
  Atom: Atom,
  Cpu: Cpu,
  Binary: Binary,
  Calculator: Calculator,
  Globe: Globe,
};

const colorsList = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
];

const Subjects = () => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.role === 'student';
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorsList[0]);
  const [iconName, setIconName] = useState('BookOpen');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const { data } = await API.post('/subjects', {
        name: name.trim(),
        color,
        icon: iconName,
      });
      setSubjects((prev) => [...prev, data]);
      setName('');
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    const confirm = window.confirm(
      'Warning: Deleting this subject will delete all associated notes, AI summaries, quizzes, and flashcards. This action cannot be undone. Do you want to proceed?'
    );
    if (!confirm) return;

    try {
      await API.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((sub) => sub._id !== id));
    } catch (err) {
      alert('Failed to delete subject');
    }
  };

  const renderIcon = (name, color, size = 22) => {
    const IconComponent = iconsMap[name] || BookOpen;
    return <IconComponent size={size} style={{ color }} />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Subjects Library</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Organize notes, generate AI summaries, quizzes, and cards by subject
          </p>
        </div>
        {!isStudent && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-primary-500/10"
          >
            <Plus size={16} /> Add Subject
          </button>
        )}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="group p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              {/* Highlight bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: sub.color }} />
              
              <div className="flex items-start justify-between">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  {renderIcon(sub.icon, sub.color, 24)}
                </div>
                {!isStudent && (
                  <button
                    onClick={() => handleDeleteSubject(sub._id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Subject"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-slate-800 dark:text-white truncate">{sub.name}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1 block">
                  Subject Module
                </span>
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white dark:bg-darkCard border border-dashed border-slate-200 dark:border-darkBorder rounded-3xl">
              <BookOpen size={40} className="text-slate-300 dark:text-darkBorder mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No subjects registered yet.</p>
              {!isStudent ? (
                <>
                  <p className="text-slate-400/80 text-xs mt-1">Create subjects to map your curriculum.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 mt-4 text-xs font-semibold bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 transition-colors"
                  >
                    Create Subject Now
                  </button>
                </>
              ) : (
                <p className="text-slate-400/80 text-xs mt-1">Please ask your teacher or administrator to assign subjects.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Palette size={18} className="text-primary-500" /> Create Subject
            </h3>

            {error && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder="e.g. Operating Systems"
                  required
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Select Icon
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {Object.keys(iconsMap).map((iconKey) => {
                    const IconComp = iconsMap[iconKey];
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setIconName(iconKey)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                          iconName === iconKey
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                            : 'border-slate-200 dark:border-darkBorder text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <IconComp size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Theme Color
                </label>
                <div className="flex gap-3.5">
                  {colorsList.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-darkCard ring-2 transition-all relative flex items-center justify-center"
                      style={{
                        backgroundColor: c,
                        ringColor: color === c ? c : 'transparent',
                        transform: color === c ? 'scale(1.15)' : 'none',
                      }}
                    >
                      {color === c && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Create Subject'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
