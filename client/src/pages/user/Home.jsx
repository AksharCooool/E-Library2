import React, { useState, useEffect, useRef } from 'react';
import axios from '../../axiosConfig'; 
import { useNavigate } from 'react-router-dom';
import { 
  Search, Fire, GraphUpArrow, InfoCircle, PlayFill, 
  MoonStarsFill, SunFill, BookHalf, Heart, HeartFill, XCircle 
} from 'react-bootstrap-icons';
import { motion, AnimatePresence } from 'framer-motion';
import FOG from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';
import toast from 'react-hot-toast';

const CustomLoader = () => (
  <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-50 z-50 fixed top-0 left-0">
    <motion.div animate={{ rotateY: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-gray-900 mb-6"><BookHalf size={80} /></motion.div>
    <p className="text-gray-400 font-bold tracking-widest text-xs animate-pulse">LOADING COLLECTION...</p>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  
  // STATES
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState("All");

  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const categories = ["All", "Fiction", "Self-Help", "Business", "Tech", "Sci-Fi", "Psychology"];

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksRes = await axios.get('/books');
        setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);

        try {
            const favsRes = await axios.get('/users/favorites');
            const favIds = (favsRes.data || []).map(book => book._id || book); 
            setFavorites(favIds);
        } catch (authError) {
            // Not logged in, ignore
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchData();
  }, []);

  // --- 2. VANTA EFFECT ---
  useEffect(() => {
    if (loading) return;
    if (!vantaEffect && vantaRef.current) {
      try {
          const effect = FOG({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0xffc300,
            midtoneColor: 0xff1f00,
            lowlightColor: 0x2d00ff,
            baseColor: 0xffffff,
            blurFactor: 0.6,
            speed: 1.20,
            zoom: 0.80
          });
          setVantaEffect(effect);
      } catch (e) { console.warn(e); }
    }
    return () => { if (vantaEffect) vantaEffect.destroy(); };
  }, [loading]);

  // --- 3. DARK MODE ---
  useEffect(() => {
    if (vantaEffect) {
      if (darkMode) {
        vantaEffect.setOptions({ highlightColor: 0x7e22ce, midtoneColor: 0x3b82f6, lowlightColor: 0x111827, baseColor: 0x0f172a, speed: 0.8 });
      } else {
        vantaEffect.setOptions({ highlightColor: 0xdbeafe, midtoneColor: 0xe0e7ff, lowlightColor: 0xf3f4f6, baseColor: 0xffffff, speed: 1.5 });
      }
    }
  }, [darkMode, vantaEffect]);

  // --- 4. FILTERING ---
  const filteredBooks = books.filter(book => {
    if (!book) return false;
    const title = (book.title || "").toLowerCase();
    const author = (book.author || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = title.includes(term) || author.includes(term);
    const matchesCategory = activeTab === "All" || book.category === activeTab;
    
    return searchTerm ? matchesSearch : (matchesSearch && matchesCategory);
  });

  const trendingBooks = books.filter(b => b?.isTrending);

  // --- HANDLERS ---
  const openBookDetails = (bookId) => navigate(`/dashboard/book/${bookId}`);
  const handleRead = (e, bookId) => { e.stopPropagation(); navigate(`/dashboard/read/${bookId}`); };
  
  const toggleFavorite = async (e, bookId) => {
    e.stopPropagation();
    const user = localStorage.getItem('user');
    if (!user) return toast.error("Please login to manage favorites");

    try {
        if (favorites.includes(bookId)) {
            setFavorites(favorites.filter(id => id !== bookId));
            toast.success("Removed from Favorites");
        } else {
            setFavorites([...favorites, bookId]);
            toast.success("Added to Favorites");
        }
        await axios.put(`/users/favorites/${bookId}`);
    } catch (error) { toast.error("Failed to update favorite"); }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (loading) return <CustomLoader />;

  return (
    <div className={`relative min-h-screen w-full transition-colors duration-500 font-sans ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      
      <div ref={vantaRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="relative z-10 p-6 md:p-10 w-full max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
            <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2">Explore Library</h1>
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Find your next adventure.</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${darkMode ? 'bg-gray-800 text-yellow-400 border border-gray-700' : 'bg-white text-gray-400 border border-gray-100'}`}>
              {darkMode ? <SunFill size={20} /> : <MoonStarsFill size={20} />}
            </button>
        </div>

        {/* SEARCH BAR */}
        <div className={`relative flex items-center w-full max-w-3xl mx-auto mb-12 p-2 rounded-2xl shadow-2xl backdrop-blur-xl border ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-white'}`}>
            <Search className={`absolute left-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
            <input 
                type="text" 
                placeholder="Search by title, author, or category..." 
                className={`w-full py-4 pl-14 pr-4 bg-transparent border-none text-lg font-medium outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 text-gray-400 hover:text-red-500 transition-colors">
                    <XCircle size={18} />
                </button>
            )}
        </div>

        {/* --- SECTIONS (Hidden on Search) --- */}
        {!searchTerm && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
               <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Fire size={20} /></div>
                        <h2 className="text-2xl font-bold">Trending Now</h2>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar">
                        {trendingBooks.length > 0 ? trendingBooks.map((book) => (
                            <motion.div key={book._id} whileHover={{ y: -5 }} onClick={() => openBookDetails(book._id)} className={`min-w-[180px] p-3 rounded-2xl cursor-pointer shadow-lg backdrop-blur-md border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white'}`}>
                                <img src={book.coverImage} alt={book.title} className="w-full h-60 object-cover rounded-xl shadow-md mb-4" />
                                <h3 className="font-bold truncate">{book.title}</h3>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
                            </motion.div>
                        )) : (<p className="text-gray-500">No trending books yet.</p>)}
                    </div>
                </div>

                <div className={`p-6 rounded-3xl shadow-xl backdrop-blur-md border h-fit ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/60 border-white'}`}>
                    <div className="flex items-center gap-2 mb-6">
                        <GraphUpArrow className="text-blue-500" size={20} />
                        <h2 className="text-xl font-bold">Most Read</h2>
                    </div>
                    <div className="space-y-4">
                        {books.slice(0, 3).map((book, index) => (
                            <div key={book._id} onClick={() => openBookDetails(book._id)} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`}>
                                <span className="text-2xl font-black opacity-30">0{index + 1}</span>
                                <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                                <div>
                                    <h4 className="font-bold text-sm line-clamp-1">{book.title}</h4>
                                    <p className="text-xs opacity-60">{book.reads || 0} reads</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- MAIN GRID --- */}
        <div>
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
               <h2 className="text-3xl font-bold">{searchTerm ? `Results for "${searchTerm}"` : "Full Collection"}</h2>
               
               {!searchTerm && (
                   <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2">
                       {categories.map((cat) => (
                           <button key={cat} onClick={() => setActiveTab(cat)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === cat ? (darkMode ? "bg-white text-black" : "bg-black text-white") : (darkMode ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-500 hover:bg-gray-100")}`}>
                               {cat}
                           </button>
                       ))}
                   </div>
               )}
            </div>

            {/* --- GRID CONTAINER (REMOVED 'layout' PROP) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* REMOVED 'mode="popLayout"' - STANDARD ANIMATION ONLY */}
                <AnimatePresence>
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                            <motion.div 
                                key={book._id} 
                                variants={itemVariants}
                                initial="hidden" 
                                animate="visible" 
                                exit="hidden"
                                className={`rounded-2xl p-4 shadow-lg backdrop-blur-md border group relative overflow-hidden ${darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-white/70 border-white'}`}
                            >
                                <div className="h-72 overflow-hidden rounded-xl mb-4 relative shadow-inner bg-gray-100 group">
                                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    
                                    <button 
                                        onClick={(e) => toggleFavorite(e, book._id)}
                                        className={`absolute top-3 right-3 p-2 rounded-full transition-all shadow-md z-30 ${favorites.includes(book._id) ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
                                    >
                                        {favorites.includes(book._id) ? <HeartFill size={18} /> : <Heart size={18} />}
                                    </button>

                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3">
                                        <button onClick={() => openBookDetails(book._id)} className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all"><InfoCircle /> Details</button>
                                        <button onClick={(e) => handleRead(e, book._id)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all"><PlayFill /> Read</button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold truncate">{book.title}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
                                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{book.category}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-70">
                            <Search size={48} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className="text-xl font-bold mb-2">No books found matching "{searchTerm}"</p>
                            <button onClick={() => setSearchTerm('')} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors">Clear Search</button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Home;