import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { useVoice } from '../hooks/useVoice';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Trash2,
  FileText,
  Sparkles,
  Bot,
  User,
  Info,
  Loader2
} from 'lucide-react';

const AIChat = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlNoteId = queryParams.get('noteId');

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(urlNoteId || '');
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

  // Voice Recognition Hooks
  const { startListening, stopListening, isListening, transcript } = useVoice();

  // Scroll ref
  const chatEndRef = useRef(null);

  // Load chat history from localStorage when user or selectedNoteId changes
  useEffect(() => {
    if (!user) return;
    const storageKey = `studyai_chat_${user._id}_${selectedNoteId || 'general'}`;
    const savedHistory = localStorage.getItem(storageKey);
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Failed to parse saved chat history', err);
        loadDefaultChat();
      }
    } else {
      loadDefaultChat();
    }
  }, [selectedNoteId, user]);

  const loadDefaultChat = () => {
    setChatHistory([
      {
        sender: 'ai',
        text: `Hello ${user?.name || 'there'}! I am your StudyAI chatbot. You can ask me general subject doubts or select a notes document from the sidebar to query specific chapters. How can I help you study today?`,
      },
    ]);
  };

  // Sync transcription into input text when finished
  useEffect(() => {
    if (transcript) {
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setNotesLoading(true);
        const { data } = await API.get('/notes');
        setNotes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setNotesLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMessage = { sender: 'user', text: inputText.trim() };
    let newHistory = [];
    setChatHistory((prev) => {
      newHistory = [...prev, userMessage];
      if (user) {
        const storageKey = `studyai_chat_${user._id}_${selectedNoteId || 'general'}`;
        localStorage.setItem(storageKey, JSON.stringify(newHistory));
      }
      return newHistory;
    });
    setInputText('');
    setIsSending(true);

    try {
      const { data } = await API.post('/chat', {
        question: userMessage.text,
        chatHistory: newHistory.slice(-8), // Send last 8 messages for context
        noteId: selectedNoteId || null,
      });

      setChatHistory((prev) => {
        const updated = [...prev, { sender: 'ai', text: data.reply }];
        if (user) {
          const storageKey = `studyai_chat_${user._id}_${selectedNoteId || 'general'}`;
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
        return updated;
      });
    } catch (error) {
      setChatHistory((prev) => {
        const updated = [
          ...prev,
          { sender: 'ai', text: 'Sorry, I encountered an error. Please try asking again.' },
        ];
        if (user) {
          const storageKey = `studyai_chat_${user._id}_${selectedNoteId || 'general'}`;
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
        return updated;
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    const confirm = window.confirm('Clear all conversation history?');
    if (confirm) {
      if (user) {
        const storageKey = `studyai_chat_${user._id}_${selectedNoteId || 'general'}`;
        localStorage.removeItem(storageKey);
      }
      setChatHistory([
        {
          sender: 'ai',
          text: `Chat cleared. Ask me any study question or choose a notes context from the sidebar to query.`,
        },
      ]);
    }
  };

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="h-[80vh] flex flex-col md:flex-row bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl overflow-hidden shadow-sm">
      {/* Sidebar: Notes Context Selector (Desktop only) */}
      <div className="hidden md:flex w-64 border-r border-slate-100 dark:border-darkBorder flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
            Study Context
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Select notes to query specifically</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* General study button */}
          <button
            onClick={() => setSelectedNoteId('')}
            className={`w-full text-left px-3.5 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
              !selectedNoteId
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Bot size={16} /> General Assistant
          </button>

          <div className="w-full h-px bg-slate-100 dark:bg-darkBorder my-2" />

          {/* Notes files list */}
          {notesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={16} className="animate-spin text-primary-500" />
            </div>
          ) : (
            notes.map((note) => (
              <button
                key={note._id}
                onClick={() => setSelectedNoteId(note._id)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 transition-all truncate ${
                  selectedNoteId === note._id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <FileText size={16} className="flex-shrink-0 mt-0.5" />
                <span className="truncate">{note.title}</span>
              </button>
            ))
          )}

          {!notesLoading && notes.length === 0 && (
            <div className="py-8 text-center text-[10px] text-slate-400">
              No notes files found to select as context.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Context Selector Dropdown (Mobile only) */}
      <div className="md:hidden p-4 border-b border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">Context:</span>
        <select
          value={selectedNoteId}
          onChange={(e) => setSelectedNoteId(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        >
          <option value="">General Assistant</option>
          {notes.map((note) => (
            <option key={note._id} value={note._id}>
              {note.title}
            </option>
          ))}
        </select>
      </div>

      {/* Main Chat Thread Frame */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/20 dark:bg-transparent">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-slate-800/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-primary-500" />
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">AI Study Assistant</h4>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                <Info size={10} />
                {selectedNoteId
                  ? `Active Context: ${notes.find((n) => n._id === selectedNoteId)?.title}`
                  : 'Active Context: General Knowledge base'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Message Thread list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {chatHistory.map((msg, index) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold ${
                    isAI ? 'bg-indigo-600' : 'bg-primary-500'
                  }`}
                >
                  {isAI ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-3xl shadow-sm text-xs leading-relaxed ${
                    isAI
                      ? 'bg-white dark:bg-darkCard text-slate-700 dark:text-slate-350 border border-slate-100 dark:border-darkBorder whitespace-pre-wrap'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-3xl bg-white dark:bg-darkCard text-slate-400 border border-slate-100 dark:border-darkBorder text-xs flex items-center gap-2 font-semibold">
                <Loader2 size={14} className="animate-spin text-primary-500" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Panel */}
        <div className="p-4 border-t border-slate-100 dark:border-darkBorder">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            {/* STT Dictation Bell */}
            <button
              type="button"
              onClick={handleVoiceClick}
              className={`p-3 rounded-2xl border transition-colors flex items-center justify-center flex-shrink-0 ${
                isListening
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-500 animate-pulse'
                  : 'border-slate-200 dark:border-darkBorder text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
              title={isListening ? 'Stop Listening' : 'Dictate with Microphone'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-darkBorder bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
              placeholder={isListening ? 'Listening to your voice...' : 'Ask your study doubt here...'}
              disabled={isSending}
              required
            />

            {/* Send */}
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="p-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center flex-shrink-0 shadow-md transition-colors disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
