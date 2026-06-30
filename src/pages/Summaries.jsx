import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import { useVoice } from '../hooks/useVoice';
import jsPDF from 'jspdf';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  FileText,
  Volume2,
  VolumeX,
  Download,
  Bookmark,
  Sparkles,
  BookOpen,
  List,
  FileCheck,
  Award,
  Loader2,
  RefreshCw
} from 'lucide-react';

const parseInlineFormatting = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    
    const mathParts = part.split(/(\$\$.*?\$\$|\$.*?\$)/g);
    if (mathParts.length > 1) {
      return mathParts.map((subPart, j) => {
        if ((subPart.startsWith('$$') && subPart.endsWith('$$')) || (subPart.startsWith('$') && subPart.endsWith('$'))) {
          const delim = subPart.startsWith('$$') ? 2 : 1;
          const rawEq = subPart.slice(delim, -delim);
          try {
            const html = katex.renderToString(rawEq, { displayMode: false, throwOnError: false });
            return <span key={j} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (err) {
            return <code key={j} className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{rawEq}</code>;
          }
        }
        return subPart;
      });
    }
    return part;
  });
};

const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      const eq = trimmed.slice(2, -2).trim();
      try {
        const html = katex.renderToString(eq, { displayMode: true, throwOnError: false });
        return (
          <div 
            key={index} 
            className="my-4 p-4 bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-darkBorder rounded-2xl overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        return (
          <div key={index} className="my-4 p-4 bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-darkBorder rounded-2xl overflow-x-auto text-center font-serif text-sm text-indigo-600 dark:text-indigo-400">
            {eq}
          </div>
        );
      }
    }
    if (line.startsWith('#### ')) {
      return (
        <h5 key={index} className="text-sm font-bold text-slate-800 dark:text-white mt-4 mb-2">
          {parseInlineFormatting(line.slice(5))}
        </h5>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h4 key={index} className="text-base font-bold text-slate-800 dark:text-white mt-6 mb-3">
          {parseInlineFormatting(line.slice(4))}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={index} className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-4">
          {parseInlineFormatting(line.slice(3))}
        </h3>
      );
    }
    if (trimmed.startsWith('- ')) {
      return (
        <ul key={index} className="list-disc list-inside ml-4 my-1.5 space-y-1">
          <li className="text-slate-700 dark:text-slate-350">
            {parseInlineFormatting(trimmed.slice(2))}
          </li>
        </ul>
      );
    }
    if (trimmed === '') {
      return <div key={index} className="h-2" />;
    }
    return (
      <p key={index} className="my-2 text-slate-700 dark:text-slate-350 leading-relaxed">
        {parseInlineFormatting(line)}
      </p>
    );
  });
};

const Summaries = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlNoteId = queryParams.get('noteId');

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(urlNoteId || '');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detailed');

  // Speech synthesis hook
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setNotesLoading(true);
        const { data } = await API.get('/notes');
        setNotes(data);
        if (data.length > 0 && !selectedNoteId) {
          setSelectedNoteId(data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setNotesLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Fetch summary if noteId changes
  useEffect(() => {
    if (!selectedNoteId) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setSummary(null);
        // GET check if summary exists (returns list filtered by noteId)
        const { data } = await API.get(`/summaries?noteId=${selectedNoteId}`);
        if (data.length > 0) {
          setSummary(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [selectedNoteId]);

  const handleGenerateSummary = async (regenerate = false) => {
    if (!selectedNoteId) return;

    const shouldRegenerate = typeof regenerate === 'boolean' ? regenerate : false;

    try {
      setLoading(true);
      const { data } = await API.post('/summaries', { noteId: selectedNoteId, regenerate: shouldRegenerate });
      setSummary(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!summary) return;
    try {
      const { data } = await API.patch(`/summaries/${summary._id}/bookmark`);
      setSummary((prev) => ({ ...prev, isBookmarked: data.isBookmarked }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAloud = () => {
    if (!summary) return;
    if (isSpeaking) {
      stopSpeaking();
    } else {
      let readText = '';
      if (activeTab === 'short') {
        readText = summary.shortSummary;
      } else if (activeTab === 'concepts') {
        readText = 'Key Concepts. ' + summary.keyConcepts.join('. ');
      } else if (activeTab === 'bullet') {
        readText = 'Bullet Points. ' + summary.bulletPoints.join('. ');
      } else {
        readText = summary.detailedSummary;
      }
      speak(readText);
    }
  };

  const handleExportPDF = () => {
    if (!summary) return;
    const doc = new jsPDF();
    const noteTitle = notes.find((n) => n._id === selectedNoteId)?.title || 'Notes Summary';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('StudyAI Study Summary', 20, 20);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Source: ${noteTitle}`, 20, 30);
    doc.text(`Generated: ${new Date(summary.createdAt).toLocaleDateString()}`, 20, 38);

    doc.setLineWidth(0.5);
    doc.line(20, 44, 190, 44);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Overview Summary', 20, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitShort = doc.splitTextToSize(summary.shortSummary, 170);
    doc.text(splitShort, 20, 60);

    let yPosition = 60 + splitShort.length * 5 + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Key Concepts', 20, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    summary.keyConcepts.forEach((concept) => {
      const splitConcept = doc.splitTextToSize(`• ${concept}`, 170);
      doc.text(splitConcept, 20, yPosition);
      yPosition += splitConcept.length * 5;
    });

    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Key Revision Highlights', 20, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    summary.bulletPoints.forEach((pt) => {
      const splitPt = doc.splitTextToSize(`• ${pt}`, 170);
      doc.text(splitPt, 20, yPosition);
      yPosition += splitPt.length * 5;
    });

    doc.save(`StudyAI_Summary_${noteTitle.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Summary Generator</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Condense study material into key definitions, brief summaries, and revision bullets
          </p>
        </div>

        {/* Note selector */}
        {!notesLoading && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Note:</span>
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs font-semibold"
            >
              {notes.map((n) => (
                <option key={n._id} value={n._id}>
                  {n.title}
                </option>
              ))}
              {notes.length === 0 && <option value="">No notes uploaded</option>}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold animate-pulse-slow">
            AI Assistant is parsing, conceptualizing, and summarizing...
          </p>
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detailed Summary view panel */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBorder pb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-primary-500" /> Study Guide Notes
              </h3>

              {/* Toolbar */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReadAloud}
                  className={`p-2 rounded-xl transition-colors shadow-sm ${
                    isSpeaking
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500'
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Read Summary Aloud'}
                >
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <button
                  onClick={handleExportPDF}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 shadow-sm"
                  title="Download PDF Summary"
                >
                  <Download size={16} />
                </button>

                <button
                  onClick={() => handleGenerateSummary(true)}
                  disabled={loading}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 shadow-sm transition-all"
                  title="Regenerate Summary"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>

                <button
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-xl shadow-sm transition-colors ${
                    summary.isBookmarked
                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 hover:text-amber-500'
                  }`}
                  title="Bookmark Summary"
                >
                  <Bookmark size={16} className={summary.isBookmarked ? 'fill-amber-500' : ''} />
                </button>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <button
                onClick={() => setActiveTab('detailed')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'detailed'
                    ? 'bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Detailed Explanation
              </button>
              <button
                onClick={() => setActiveTab('short')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'short'
                    ? 'bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Brief Summary
              </button>
            </div>

            {/* Content box */}
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {activeTab === 'detailed' ? (
                <div className="bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-darkBorder p-5 rounded-2xl">
                  {renderFormattedText(summary.detailedSummary)}
                </div>
              ) : (
                <div className="bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-darkBorder p-5 rounded-2xl">
                  <p className="font-semibold text-slate-800 dark:text-white mb-2">Short Overview</p>
                  {renderFormattedText(summary.shortSummary)}
                </div>
              )}
            </div>
          </div>

          {/* Key concepts & bullet points side bar */}
          <div className="space-y-8">
            {/* Key concepts */}
            <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen size={16} className="text-primary-500" /> Key Concepts
              </h4>
              <ul className="space-y-3.5">
                {summary.keyConcepts.map((concept, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    <span className="min-w-0 break-words">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bullet points */}
            <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <List size={16} className="text-indigo-500" /> Exam Revision Points
              </h4>
              <ul className="space-y-3">
                {summary.bulletPoints.map((pt, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 min-w-0">
                    <FileCheck size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="min-w-0 break-words">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl space-y-4 shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/10 mx-auto">
            <Sparkles size={26} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">AI Study Summary Empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
              Analyze your notes document using AI to outline concepts and detailed definitions.
            </p>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={!selectedNoteId}
            className="px-5 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
          >
            Generate AI Summary
          </button>
        </div>
      )}
    </div>
  );
};

export default Summaries;
