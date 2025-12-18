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
  const hasResumed = useRef(false);

  // ---------- STATE ----------
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [pageText, setPageText] = useState(""); 
  
  // NEW: State for book details
  const [bookDetails, setBookDetails] = useState({ title: "this book", author: "unknown" });

  // AI Chat State
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hi! I'm reading this page with you. Ask me anything or click 'Summarize Page'." }
  ]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ---------- 1. FETCH BOOK & PROGRESS ----------
  useEffect(() => {
    const initializeReader = async () => {
      setPdfUrl(`http://localhost:5000/api/books/stream/${id}`);
      try {
        // Fetch book info for AI context
        const { data: book } = await axios.get(`/books/${id}`);
        if(book) setBookDetails({ title: book.title, author: book.author });

        const { data: user } = await axios.get('/users/profile');
        if (user && user.readingProgress) {
          const savedProgress = user.readingProgress.find(p => 
            (p.bookId?._id === id) || (p.bookId === id)
          );
          if (savedProgress && savedProgress.currentPage > 1) {
            setPageNumber(savedProgress.currentPage);
            if (!hasResumed.current) {
              toast.success(`Resumed at page ${savedProgress.currentPage}`, { 
                position: 'top-center',
                id: 'resume-toast' 
              });
              hasResumed.current = true;
            }
          }
        }
      } catch (error) {
        console.warn("Reading progress not loaded");
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
          console.error("Failed to save progress", error);
      }
  };

  // ---------- PDF HANDLERS ----------
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    updateDatabase(pageNumber, numPages);
  };

  const onPageLoadSuccess = async (page) => {
    try {
      const textContent = await page.getTextContent();
      const strings = textContent.items.map(item => item.str);
      const combinedText = strings.join(" ").replace(/\s+/g, ' ').trim();
      setPageText(combinedText);
    } catch (err) {
      console.error("Text extraction failed:", err);
    }
  };

  const changePage = (offset) => {
      setPageNumber(prevPage => {
          const newPage = prevPage + offset;
          if (newPage < 1 || newPage > numPages) return prevPage;
          setPageText(""); 
          updateDatabase(newPage, numPages);
          return newPage;
      });
  };

  // ---------- REAL AI LOGIC ----------
  const addMessage = (role, text) => {
    setChatHistory(prev => [...prev, { role, text }]);
  };

  const callGroqAPI = async (message) => {
    if (!pageText || pageText.trim().length === 0) {
        toast.error("Still reading the page... try again in a second!", { id: 'wait-toast' });
        return;
    }

    setIsTyping(true);
    try {
      // 🚀 THE KEY CHANGE: Sending history, title, and author
      const { data } = await axios.post('/ai/chat', {
        message: message,
        history: chatHistory, // Pass existing chat so AI remembers
        pageContent: pageText, 
        pageNumber: pageNumber,
        bookTitle: bookDetails.title,
        bookAuthor: bookDetails.author
      });
      addMessage('ai', data.reply);
    } catch (error) {
      console.error("AI Error:", error);
      addMessage('ai', "Sorry, I'm having trouble connecting to my brain right now.");
    } finally {
      setIsTyping(false);
      if (chatContainerRef.current) {
        setTimeout(() => {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }, 100);
      }
    }
  };

  const handleSummarize = () => {
    const msg = `Summarize page ${pageNumber} of "${bookDetails.title}" for me.`;
    addMessage('user', "Summarize this page."); // UI stays clean
    callGroqAPI(msg); // AI gets the detailed command
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    const msg = userQuestion;
    addMessage('user', msg);
    setUserQuestion("");
    callGroqAPI(msg);
  };

  // ---------- UI (INTACT) ----------
  return (
    <div className="bg-gray-100 min-h-screen w-full flex flex-col relative overflow-hidden font-sans text-black">
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

      <div className="flex-1 mt-20 mb-24 overflow-y-auto flex justify-center p-4 z-0">
        {pdfUrl ? (
            <div className="shadow-2xl border border-gray-200 bg-white h-fit">
            <Document 
                file={pdfUrl} 
                onLoadSuccess={onDocumentLoadSuccess} 
                loading={<div className="p-20 text-gray-400">Loading Book PDF...</div>}
                error={<div className="p-20 text-red-500">Failed to load PDF. Check connection.</div>}
            >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderTextLayer={true} 
                  renderAnnotationLayer={false} 
                  onLoadSuccess={onPageLoadSuccess} 
                />
            </Document>
            </div>
        ) : (
            <div className="p-20 text-gray-400 mt-20">Initializing Reader...</div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 h-20 flex items-center justify-between px-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1} 
            className="flex items-center gap-2 px-6 py-3 font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
        >
            <ChevronLeft /> Prev
        </button>
        
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
                    showAiPanel ? 'bg-purple-600 text-white' : 'bg-black text-white hover:scale-105'
                }`}
            >
                <Magic /> {showAiPanel ? 'Hide AI' : 'AI Companion'}
            </button>
        </div>
      </div>

      {showAiPanel && (
        <div className="fixed top-16 bottom-20 right-0 w-full md:w-96 bg-white shadow-2xl z-40 flex flex-col border-l">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2"><Magic /> AI Companion</h3>
            <button onClick={() => setShowAiPanel(false)} className="p-2 hover:bg-gray-200 rounded-full text-black"><X size={20} /></button>
          </div>

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