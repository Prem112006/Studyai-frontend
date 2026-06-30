import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  ShieldAlert,
  Users,
  Trash2,
  UserCheck,
  GraduationCap,
  School
} from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      // Fallback mocks
      setUsers([
        { _id: '1', name: 'John Student', username: 'student', email: 'student@studyai.com', role: 'student', createdAt: '2026-06-15T00:00:00Z' },
        { _id: '2', name: 'Prof. Jane Smith', username: 'teacher', email: 'teacher@studyai.com', role: 'teacher', createdAt: '2026-06-12T00:00:00Z' },
        { _id: '3', name: 'Admin User', username: 'admin', email: 'admin@studyai.com', role: 'admin', createdAt: '2026-06-01T00:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleChangeRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'student' ? 'teacher' : 'student';
    const confirm = window.confirm(`Change this user's role to '${nextRole.toUpperCase()}'?`);
    if (!confirm) return;

    try {
      const { data } = await API.patch(`/admin/users/${userId}/role`, { role: nextRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: data.role } : u))
      );
      alert('Role updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    const confirm = window.confirm(
      `CRITICAL WARNING: Are you sure you want to delete @${username}'s account? This will cascade-delete their subjects, notes, summaries, quizzes, and flashcards. This action is irreversible.`
    );
    if (!confirm) return;

    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert(`User @${username} deleted successfully.`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  const studentCount = users.filter((u) => u.role === 'student').length;
  const teacherCount = users.filter((u) => u.role === 'teacher').length;
  const filteredUsers = users.filter((u) => u.role === 'student' || u.role === 'teacher');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldAlert size={26} className="text-rose-500" /> Admin Dashboard
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Overview of platform users and registered student/teacher statistics
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
            <GraduationCap size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Students</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{studentCount}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <School size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Teachers</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{teacherCount}</p>
          </div>
        </div>
      </div>

      {/* User Management table */}
      <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users size={18} className="text-primary-500" /> Platform User Directory
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-darkBorder text-slate-400 font-bold uppercase tracking-wider pb-2">
                <th className="py-2.5">User</th>
                <th className="py-2.5">Email</th>
                <th className="py-2.5">Role</th>
                <th className="py-2.5">Joined</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkBorder">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="text-slate-700 dark:text-slate-300">
                  <td className="py-3 font-semibold">
                    <p className="text-slate-800 dark:text-white font-bold">{u.name}</p>
                    <span className="text-[10px] text-slate-400">@{u.username}</span>
                  </td>
                  <td className="py-3 font-mono">{u.email}</td>
                  <td className="py-3 capitalize">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      u.role === 'teacher'
                        ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right space-x-1.5">
                    <button
                      onClick={() => handleChangeRole(u._id, u.role)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                      title="Toggle Role"
                    >
                      <UserCheck size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id, u.username)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-xs text-slate-400">
                    No registered students or teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
