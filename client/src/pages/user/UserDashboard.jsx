import React, { useState, useEffect, useRef } from 'react';
import axios from '../../axiosConfig'; // <--- USE YOUR AXIOS CONFIG
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
import { 
  Book, Star, Heart, BellFill, 
  SunFill, MoonStarsFill, BookHalf, PlayFill
} from 'react-bootstrap-icons';

// --- CUSTOM LOADER ---
const CustomLoader = () => (
  <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-50 z-50 fixed top-0 left-0">
    <motion.div 
      animate={{ rotateY: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="text-gray-900 mb-6"
    >
      <BookHalf size={80} />
    </motion.div>
    <motion.div 
        initial={{ width: 0 }} animate={{ width: 200 }} 
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-1 bg-gray-900 rounded-full"
    />
    <p className="text-gray-400 font-bold tracking-widest text-xs mt-4 animate-pulse">LOADING DASHBOARD...</p>
  </div>
);

const UserDashboard = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [readingList, setReadingList] = useState([]); // Stores dynamic reading progress
  
  // Vanta Refs
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  // Notifications (Static for now)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome!", content: "Books you start reading will appear in your dashboard.", type: "info", read: false },
    { id: 2, title: "Tip", content: "Click 'Read' on any book to resume where you left off.", type: "alert", read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false); 
  const [selectedMessage, setSelectedMessage] = useState(null); 

  const unreadList = notifications.filter(n => !n.read);

  // --- 1. FETCH DATA FROM API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/auth/me'); // Gets User + Favorites + ReadingProgress
        setUser(data);
        
        // --- PROCESS READING LIST ---
        // Map the backend structure to a flat object for the table
        // Backend returns: [{ bookId: { title, cover... }, currentPage: 5, totalPages: 100 }]
        const activeReads = (data.readingProgress || [])
            .filter(item => item.bookId !== null) // Safety check if book was deleted
            .map(item => {
                const current = item.currentPage || 1;
                const total = item.totalPages || 100;
                const percent = Math.round((current / total) * 100);

                return {
                    _id: item.bookId._id,
                    title: item.bookId.title,
                    author: item.bookId.author,
                    coverImage: item.bookId.coverImage,
                    currentPage: current,
                    totalPages: total,
                    progress: percent > 100 ? 100 : percent // Cap at 100%
                };
            });
        
        setReadingList(activeReads);
        setLoading(false);
      } catch (error) {
        console.error("Auth failed", error);
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  // --- 2. INIT VANTA ---
  useEffect(() => {
    if (loading) return;
    if (!vantaRef.current) return; 
    if (!vantaEffect) {
      const effect = NET({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        points: 12.00,
        maxDistance: 22.00,
        spacing: 18.00,
        color: 0x3b82f6, 
        backgroundColor: 0xffffff 
      });
      setVantaEffect(effect);
    }
    return () => { if (vantaEffect) vantaEffect.destroy(); };
  }, [loading]);

  // --- 3. DARK MODE ---
  useEffect(() => {
    if (vantaEffect) {
      vantaEffect.setOptions({
        color: darkMode ? 0x60a5fa : 0x3b82f6,
        backgroundColor: darkMode ? 0x111827 : 0xffffff
      });
    }
  }, [darkMode, vantaEffect]);


  // --- HANDLERS ---
  const handleRead = (bookId) => {
      navigate(`/dashboard/read/${bookId}`);
  };

  const handleNotificationClick = (note) => {
    setSelectedMessage(note); 
    setShowNotifications(false); 
    setNotifications(notifications.map(n => n.id === note.id ? { ...n, read: true } : n));
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { y: 30, opacity: 0, scale: 0.95 }, visible: { y: 0, opacity: 1, scale: 1 } };

  if (loading) return <CustomLoader />;

  return (
    <div className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 font-sans ${darkMode ? 'text-white' : 'text-gray-900'}`} onClick={() => setShowNotifications(false)}>
      
      {/* BACKGROUND */}
      <div ref={vantaRef} className="fixed inset-0 z-0 pointer-events-none opacity-80" />
      
      {/* CONTENT */}
      <motion.div 
        initial="hidden" animate="visible" variants={containerVariants}
        className="relative z-10 p-6 md:p-10 w-full max-w-7xl mx-auto"
      >
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl font-black tracking-tight mb-2">My Library</h1>
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Welcome back, {user?.name.split(' ')[0]}! Pick up where you left off.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center gap-4">
             {/* Dark Mode */}
             <button
              onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }}
              className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 text-yellow-400 border border-gray-700' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              {darkMode ? <SunFill size={20} /> : <MoonStarsFill size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-600 border border-gray-100'}`}
              >
                  <BellFill size={20} />
                  {unreadList.length > 0 && <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className={`absolute right-0 mt-4 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50 backdrop-blur-xl ${darkMode ? 'bg-gray-900/95 border-gray-700 text-gray-200' : 'bg-white/95 border-gray-100 text-gray-900'}`}
                    >
                         <div className="max-h-64 overflow-y-auto p-2">
                            {unreadList.length === 0 ? <p className="p-4 text-center text-sm opacity-50">No new notifications</p> : 
                             unreadList.map(n => (
                                <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 mb-2 rounded-xl cursor-pointer flex gap-3 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                    <div><p className="text-sm font-bold">{n.title}</p><p className="text-xs opacity-60">{n.content}</p></div>
                                </div>
                             ))
                            }
                         </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* --- STATS (Dynamic) --- */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
              // Reading List Length = Books Started
              { title: "Books Started", value: readingList.length, icon: <Book size={24} />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              // Reviews (Static for now)
              { title: "Reviews", value: "0", icon: <Star size={24} />, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              // Favorites (Dynamic)
              { title: "Favorites", value: user?.favorites?.length || 0, icon: <Heart size={24} />, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" }
          ].map((stat, index) => (
              <motion.div 
                key={index} variants={itemVariants} whileHover={{ y: -5 }}
                className={`p-6 rounded-3xl backdrop-blur-sm border shadow-lg flex items-center gap-5 transition-all ${darkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/60 border-gray-200'}`}
              >
                  <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner border ${stat.border}`}>{stat.icon}</div>
                  <div><h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{stat.title}</h3><p className="text-4xl font-black">{stat.value}</p></div>
              </motion.div>
          ))}
        </motion.div>

        {/* --- DYNAMIC READING TABLE --- */}
        <motion.div 
          variants={itemVariants}
          className={`rounded-3xl shadow-xl border overflow-hidden backdrop-blur-md ${darkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/70 border-gray-200'}`}
        >
          <div className={`p-8 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-2xl font-bold">Continue Reading</h2>
              <button 
                onClick={() => navigate('/dashboard/home')}
                className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Browse Library
              </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <th className="p-6">Book Details</th>
                  <th className="p-6">Progress</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                {readingList.length > 0 ? (
                    readingList.map((book) => (
                    <motion.tr 
                        key={book._id} 
                        variants={itemVariants} 
                        className={`group cursor-pointer ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-white/80'}`}
                    >
                        <td className="p-6 flex items-center gap-5">
                            <motion.div whileHover={{ scale: 1.1 }} className="relative w-14 h-20 rounded-lg overflow-hidden shadow-lg">
                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                            </motion.div>
                            <div>
                                <span className="block font-bold text-lg mb-1">{book.title}</span>
                                <span className="text-sm opacity-60 font-medium">{book.author}</span>
                            </div>
                        </td>
                        <td className="p-6">
                            <div className="w-full max-w-[140px]">
                                <div className="flex justify-between text-xs font-bold mb-2 opacity-70">
                                    <span>Pg {book.currentPage}</span>
                                    <span>{book.progress}%</span>
                                </div>
                                <div className={`h-2 rounded-full w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div 
                                        className="h-full rounded-full bg-blue-500 transition-all duration-1000" 
                                        style={{ width: `${book.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </td>
                        <td className="p-6 text-right">
                            <motion.button 
                                onClick={() => handleRead(book._id)}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 ml-auto ${darkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}
                            >
                                <PlayFill /> Resume
                            </motion.button>
                        </td>
                    </motion.tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" className="p-10 text-center opacity-50">
                            You haven't started reading any books yet. Go to "Browse Library" to start!
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* --- MODAL --- */}
        <AnimatePresence>
          {selectedMessage && (
              <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60]"
                  onClick={() => setSelectedMessage(null)}
              >
                  <motion.div 
                      initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
                      onClick={(e) => e.stopPropagation()}
                      className={`p-8 rounded-3xl shadow-2xl w-full max-w-lg relative ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}
                  >
                      <h2 className="text-2xl font-bold mb-4">{selectedMessage.title}</h2>
                      <p className={`mb-6 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedMessage.content}</p>
                      <button onClick={() => setSelectedMessage(null)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold w-full">Close</button>
                  </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UserDashboard;