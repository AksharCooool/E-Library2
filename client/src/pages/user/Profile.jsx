import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Person, Envelope, Book, ClockHistory, Heart, 
  Gear, BoxArrowRight, Trash, PlayFill, Calendar3, JournalBookmark, CheckCircle
} from 'react-bootstrap-icons';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig'; 

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorites');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State for Settings
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      gender: 'male'
  });

  // --- 1. FETCH DATA ---
  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setUser(data);
      
      // Initialize form data with fetched user info
      setFormData({
          name: data.name,
          email: data.email,
          gender: data.gender || 'male',
          password: '' // Keep password empty initially
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // --- 2. HANDLERS ---

  const handleUpdateProfile = async (e) => {
      e.preventDefault();
      try {
          // Send update request
          await axios.put('/users/profile', formData);
          toast.success("Profile updated successfully!");
          
          // Refresh user data to update UI (Name, Avatar, etc.)
          fetchUserProfile();
      } catch (error) {
          toast.error(error.response?.data?.message || "Update failed");
      }
  };

  const handleLogout = async () => {
    try {
        await axios.post('/auth/logout');
        localStorage.removeItem('user');
        toast.success("Logged out");
        navigate('/login');
    } catch (error) {
        toast.error("Logout failed");
    }
  };

  const handleRemoveFavorite = async (bookId) => {
      try {
          await axios.put(`/users/favorites/${bookId}`);
          toast.success("Removed from favorites");
          fetchUserProfile(); // Refresh list
      } catch (error) {
          toast.error("Failed to remove");
      }
  };

  const handleReadBook = (bookId) => {
      navigate(`/dashboard/read/${bookId}`);
  };

  // --- HELPERS ---
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading Profile...</div>;

  // Avatar based on gender
  const avatarUrl = user.gender === 'female' 
    ? "https://cdn-icons-png.flaticon.com/512/6997/6997662.png" 
    : "https://cdn-icons-png.flaticon.com/512/236/236831.png";

  // Sort Activity: Most recently read first
  // Filter out any null bookIds to prevent crashes if a book was deleted
  const sortedActivity = (user.readingProgress || [])
    .filter(item => item.bookId) 
    .sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead));

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen w-full relative bg-gray-50 overflow-hidden font-sans p-4 md:p-8">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
         <motion.div animate={{ x: [0, -30, 0], y: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-purple-200/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER CARD */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-soft border border-white mb-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg">
                    <img src={avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white bg-white" />
                </div>
            </div>

            <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-black text-gray-900 mb-1">{user.name}</h1>
                <div className="flex flex-col md:flex-row items-center gap-3 text-gray-500 text-sm font-medium mb-4">
                    <span className="flex items-center gap-1"><Envelope /> {user.email}</span>
                    <span className="hidden md:block">•</span>
                    <span className="flex items-center gap-1"><Calendar3 /> Joined {formatDate(user.createdAt)}</span>
                    <span className="hidden md:block">•</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {user.role === 'admin' ? 'Administrator' : 'Premium Member'}
                    </span>
                </div>
                <div className="flex gap-8 justify-center md:justify-start">
                    <div className="text-center">
                        <p className="text-2xl font-black text-gray-900">{user.favorites?.length || 0}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">Favorites</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-gray-900">{user.readingProgress?.length || 0}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">Books Started</p>
                    </div>
                </div>
            </div>
        </div>

        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* SIDEBAR MENU */}
            <div className="lg:col-span-1 space-y-2">
                <TabButton active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} icon={<Heart />} label="Favorites" />
                <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<ClockHistory />} label="Activity History" />
                <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Gear />} label="Settings" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-colors mt-4"><BoxArrowRight /> Log Out</button>
            </div>

            {/* CONTENT AREA */}
            <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                    
                    {/* 1. FAVORITES TAB */}
                    {activeTab === 'favorites' && (
                        <motion.div key="favorites" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/90 p-8 rounded-3xl shadow-soft min-h-[400px]">
                             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Heart className="text-red-500"/> Favorites Collection</h3>
                             
                             {user.favorites && user.favorites.length > 0 ? (
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {user.favorites.map(book => (
                                        <div key={book._id} className="flex gap-4 p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-all bg-white group">
                                            <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden shadow-sm bg-gray-200">
                                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col justify-between py-1 flex-1">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 line-clamp-1">{book.title}</h4>
                                                    <p className="text-sm text-gray-500">{book.author}</p>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => handleReadBook(book._id)} className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black flex items-center gap-1">
                                                        <PlayFill /> Read
                                                    </button>
                                                    <button onClick={() => handleRemoveFavorite(book._id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                                        <Trash />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                             ) : (
                                 <div className="text-center py-20 text-gray-400">
                                     <Heart size={40} className="mx-auto mb-3 opacity-20" />
                                     <p>No favorites yet.</p>
                                     <button onClick={() => navigate('/dashboard/home')} className="mt-4 text-blue-600 font-bold hover:underline">Browse Library</button>
                                 </div>
                             )}
                        </motion.div>
                    )}

                    {/* 2. ACTIVITY TAB (Now Dynamic) */}
                    {activeTab === 'activity' && (
                        <motion.div key="activity" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/90 p-8 rounded-3xl shadow-soft min-h-[400px]">
                             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ClockHistory className="text-blue-500"/> Activity Timeline</h3>
                             
                             {sortedActivity.length > 0 ? (
                                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                    {sortedActivity.map((activity, index) => {
                                        const percentage = Math.round((activity.currentPage / activity.totalPages) * 100) || 0;
                                        
                                        return (
                                            <div key={index} className="relative pl-12">
                                                {/* Timeline Dot */}
                                                <div className="absolute left-2 top-2 w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded-full z-10"></div>
                                                
                                                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition-all items-center">
                                                    <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden shadow-sm bg-gray-200 cursor-pointer" onClick={() => handleReadBook(activity.bookId._id)}>
                                                        <img src={activity.bookId.coverImage} alt={activity.bookId.title} className="w-full h-full object-cover" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">
                                                            {formatDate(activity.lastRead)} at {formatTime(activity.lastRead)}
                                                        </p>
                                                        <h4 className="font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleReadBook(activity.bookId._id)}>
                                                            Read <span className="text-blue-600">{activity.bookId.title}</span>
                                                        </h4>
                                                        
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[150px]">
                                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-500">{percentage}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                             ) : (
                                 <div className="text-center py-20 text-gray-400 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                     <JournalBookmark size={40} className="mx-auto mb-3 opacity-20" />
                                     <p>No reading history found.</p>
                                     <button onClick={() => navigate('/dashboard/home')} className="mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-bold shadow-lg hover:bg-gray-800 transition-all">Start Reading</button>
                                 </div>
                             )}
                        </motion.div>
                    )}

                    {/* 3. SETTINGS TAB (Now Working) */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/90 p-8 rounded-3xl shadow-soft min-h-[400px]">
                             <h3 className="text-xl font-bold mb-6">Account Settings</h3>
                             
                             <form className="space-y-5" onSubmit={handleUpdateProfile}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Display Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" 
                                        />
                                    </div>
                                    
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Gender</label>
                                        <select 
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all appearance-none"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">New Password</label>
                                        <input 
                                            type="password" 
                                            placeholder="Leave blank to keep current"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                                        <CheckCircle /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
        {icon} <span>{label}</span>
    </button>
);

export default Profile;