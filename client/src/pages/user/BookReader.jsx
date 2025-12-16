import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Magic, 
  X, ZoomIn, ZoomOut, Send 
} from 'react-bootstrap-icons';
import toast from 'react-hot-toast';
import axios from '../../axiosConfig'; 

// PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  // ---------- STATE ----------
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // AI Chat State
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hi! I'm reading this page with you. Ask me anything or click 'Summarize Page'." }
  ]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ---------- 1. FETCH BOOK & PROGRESS ----------
  useEffect(() => {
    const initializeReader = async () => {
      // 1. SET PDF URL (Do this first so book loads immediately)
      // Point directly to your backend stream
      setPdfUrl(`http://localhost:5000/api/books/stream/${id}`);

      // 2. TRY TO FETCH SAVED PROGRESS (Don't crash if this fails)
      try {
        // Try getting profile (Assuming you have a GET /api/users/profile route)
        // If not, this block handles the error gracefully
        const { data: user } = await axios.get('/users/profile').catch(() => ({ data: null }));
        
        if (user && user.readingProgress) {
            const savedProgress = user.readingProgress.find(p => p.bookId === id || (p.bookId && p.bookId._id === id));
            if (savedProgress && savedProgress.currentPage > 1) {
                setPageNumber(savedProgress.currentPage);
                toast.success(`Resumed at page ${savedProgress.currentPage}`, { position: 'top-center' });
            }
        }
      } catch (error) {
        console.warn("Could not load reading progress (User might not be logged in)");
      }
    };

    initializeReader();
  }, [id]);

  // ---------- 2. SYNC PROGRESS TO DB ----------
  const updateDatabase = async (newPage, total) => {
      try {
          await axios.put('/users/progress', {
              bookId: id,
              currentPage: newPage,
              totalPages: total || numPages 
          });
      } catch (error) {
          // Silently fail if user is not logged in
          console.error("Failed to save progress", error);
      }
  };

  // ---------- PDF HANDLERS ----------
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // Don't save page 1 immediately to avoid overwriting progress if user resumes at pg 50
  };

  const changePage = (offset) => {
      setPageNumber(prevPage => {
          const newPage = prevPage + offset;
          if (newPage < 1 || newPage > numPages) return prevPage;
          
          updateDatabase(newPage, numPages); // Save progress
          return newPage;
      });
  };

  // ---------- AI FEATURES ----------
  const addMessage = (role, text) => {
    setChatHistory(prev => [...prev, { role, text }]);
  };

  const simulateAiResponse = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('ai', text);
    }, 1500);
  };

  const handleSummarize = () => {
    addMessage('user', "Summarize this page for me.");
    simulateAiResponse(
      `Summary of page ${pageNumber}:\n• Key ideas explained\n• Important concepts highlighted\n• Easy-to-understand breakdown`
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    const question = userQuestion;
    addMessage('user', question);
    setUserQuestion("");

    simulateAiResponse(
      `Great question about page ${pageNumber}! The author emphasizes understanding systems over goals.`
    );
  };

  // ---------- UI ----------
  return (
    <div className="bg-gray-100 min-h-screen w-full flex flex-col relative overflow-hidden font-sans">

      {/* TOP BAR */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 fixed top-0 w-full z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-sm font-bold text-gray-700 uppercase tracking-widest hidden md:block">
            Reading Mode • Page {pageNumber} of {numPages || '--'}
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-white rounded-md"><ZoomOut size={16} /></button>
          <span className="text-xs font-bold w-8 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-white rounded-md"><ZoomIn size={16} /></button>
        </div>
      </div>

      {/* PDF VIEW */}
      <div className="flex-1 mt-20 mb-24 overflow-y-auto flex justify-center p-4 z-0">
        {pdfUrl ? (
            <div className="shadow-2xl border border-gray-200 bg-white">
            <Document 
                file={pdfUrl} 
                onLoadSuccess={onDocumentLoadSuccess} 
                loading={<div className="p-20 text-gray-400">Loading Book PDF...</div>}
                error={<div className="p-20 text-red-500">Failed to load PDF. Is the server running?</div>}
            >
                <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
            </Document>
            </div>
        ) : (
            <div className="p-20 text-gray-400 mt-20">Initializing Reader...</div>
        )}
      </div>

      {/* BOTTOM BAR (Navigation) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 h-20 flex items-center justify-between px-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        
        {/* LEFT: PREV BUTTON */}
        <button 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1} 
            className="flex items-center gap-2 px-6 py-3 font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
        >
            <ChevronLeft /> Prev
        </button>
        
        {/* RIGHT: NEXT + AI BUTTONS */}
        <div className="flex items-center gap-3">
            <button 
                onClick={() => changePage(1)} 
                disabled={pageNumber >= numPages} 
                className="flex items-center gap-2 px-6 py-3 font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
                Next <ChevronRight />
            </button>

            <button 
                onClick={() => setShowAiPanel(!showAiPanel)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
                    showAiPanel 
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100' 
                    : 'bg-black text-white hover:scale-105'
                }`}
            >
                <Magic /> {showAiPanel ? 'Hide AI' : 'AI Companion'}
            </button>
        </div>
      </div>

      {/* AI PANEL (Unchanged) */}
      {showAiPanel && (
        <div className="fixed top-16 bottom-20 right-0 w-full md:w-96 bg-white shadow-2xl z-40 flex flex-col border-l animate-fade-in-right">
          
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2"><Magic /> AI Companion</h3>
            <button onClick={() => setShowAiPanel(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={chatContainerRef}>
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-white border rounded-bl-none text-gray-800'}`}>
                    {msg.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-xs text-gray-400 ml-4 animate-pulse">AI is thinking...</div>}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <button 
                onClick={handleSummarize} 
                className="w-full mb-3 py-2.5 bg-purple-50 text-purple-600 text-xs font-bold rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 border border-purple-100"
            >
                <Magic size={14} /> Summarize Page {pageNumber}
            </button>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                value={userQuestion} 
                onChange={(e) => setUserQuestion(e.target.value)} 
                placeholder="Ask about this page..." 
                className="flex-1 p-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 transition-all text-black" 
              />
              <button type="submit" className="p-3 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookReader;