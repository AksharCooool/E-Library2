import React, { useState, useEffect, useRef } from 'react';
import axios from '../../axiosConfig'; 
import toast from 'react-hot-toast';

import { 
  People, Book, Eye, ChatSquareQuote, ClockHistory, 
  ArrowRight, MoonStarsFill, SunFill, Activity 
} from 'react-bootstrap-icons';
import { motion } from 'framer-motion';
import FOG from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';

const AdminDashboard = () => {
  // --- STATE ---
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true); 
  
  // Vanta State
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  // --- DYNAMIC DATA STATE ---
  const [dashboardStats, setDashboardStats] = useState({
    counts: {
        totalBooks: 0,
        activeReaders: 0,
        totalReads: 0,
        totalReviews: 0
    },
    recentActivity: []
  });

  // --- API CALL ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/admin/stats');
        setDashboardStats(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard stats");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // --- HELPERS ---
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  // --- DATA MAPPING ---
  // Map API counts to UI Cards
  const statsCards = [
    { 
        id: 1, 
        title: "Total Books", 
        value: dashboardStats.counts.totalBooks, 
        icon: <Book size={24} />, 
        color: "text-blue-500", 
        bg: "bg-blue-500/10", 
        border: "border-blue-500/20" 
    },
    { 
        id: 2, 
        title: "Active Readers", 
        value: dashboardStats.counts.activeReaders, 
        icon: <People size={24} />, 
        color: "text-purple-500", 
        bg: "bg-purple-500/10", 
        border: "border-purple-500/20" 
    },
    { 
        id: 3, 
        title: "Total Reads", 
        value: dashboardStats.counts.totalReads, 
        icon: <Eye size={24} />, 
        color: "text-green-500", 
        bg: "bg-green-500/10", 
        border: "border-green-500/20" 
    },
    { 
        id: 4, 
        title: "Reviews", 
        value: dashboardStats.counts.totalReviews, 
        icon: <ChatSquareQuote size={24} />, 
        color: "text-orange-500", 
        bg: "bg-orange-500/10", 
        border: "border-orange-500/20" 
    },
  ];

  // --- VANTA EFFECTS  ---
  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(FOG({
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
      }));
    }
    return () => { if (vantaEffect) vantaEffect.destroy(); };
  }, [vantaEffect]);

  useEffect(() => {
    if (vantaEffect) {
      if (darkMode) {
        vantaEffect.setOptions({
          highlightColor: 0x7e22ce,
          midtoneColor: 0x3b82f6,
          lowlightColor: 0x111827,
          baseColor: 0x0f172a,
          speed: 0.8
        });
      } else {
        vantaEffect.setOptions({
          highlightColor: 0xdbeafe,
          midtoneColor: 0xe0e7ff,
          lowlightColor: 0xf3f4f6,
          baseColor: 0xffffff,
          speed: 1.5
        });
      }
    }
  }, [darkMode, vantaEffect]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className={`relative min-h-screen w-full transition-colors duration-500 font-sans ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      
      {/* Background Layer */}
      <div ref={vantaRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      {/* Content Layer */}
      <motion.div 
        initial="hidden" animate="visible" variants={containerVariants}
        className="relative z-10 p-6 md:p-10 w-full max-w-7xl mx-auto"
      >
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <Activity size={24} />
                </div>
                <h1 className="text-4xl font-black tracking-tight">Admin Overview</h1>
            </motion.div>
            <motion.p variants={itemVariants} className={`text-lg font-medium ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Monitor performance and engagement.
            </motion.p>
          </div>

          <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${
                darkMode ? 'bg-gray-800 text-yellow-400 border border-gray-700' : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {darkMode ? <SunFill size={20} /> : <MoonStarsFill size={20} />}
          </motion.button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statsCards.map((stat) => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              key={stat.id} 
              className={`p-6 rounded-3xl backdrop-blur-md border shadow-lg flex items-center gap-5 transition-all ${
                  darkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/60 border-gray-200'
              }`}
            >
              <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner border ${stat.border}`}>
                {stat.icon}
              </div>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</h3>
                <p className="text-3xl font-black">
                    {loading ? "..." : stat.value.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* RECENT ACTIVITY TABLE */}
        <motion.div 
          variants={itemVariants}
          className={`rounded-3xl shadow-xl border overflow-hidden backdrop-blur-md ${
            darkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/70 border-gray-200'
          }`}
        >
            <div className={`p-8 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-xl font-bold">Live User Activity</h2>
                <button className={`text-sm font-bold flex items-center gap-2 transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                    View All <ArrowRight />
                </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <th className="p-6">User</th>
                    <th className="p-6">Content</th>
                    <th className="p-6">Activity</th>
                    <th className="p-6">Time</th>
                    <th className="p-6">Type</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                  {loading ? (
                       <tr><td colSpan="5" className="p-8 text-center opacity-50">Loading activity...</td></tr>
                  ) : dashboardStats.recentActivity.length === 0 ? (
                       <tr><td colSpan="5" className="p-8 text-center opacity-50">No recent activity.</td></tr>
                  ) : (
                    dashboardStats.recentActivity.map((item) => (
                        <tr key={item.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/40' : 'hover:bg-white/50'}`}>
                        <td className="p-6 font-bold">{item.user}</td>
                        <td className={`p-6 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.content}</td>
                        <td className="p-6">
                            {/* Dynamic Badge Coloring based on Action Type */}
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                item.type === 'user' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                                {item.action}
                            </span>
                        </td>
                        <td className={`p-6 text-sm font-medium flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <ClockHistory size={14} /> {timeAgo(item.date)}
                        </td>
                        <td className="p-6">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                    item.type === 'user' ? 'bg-green-500' : 'bg-purple-500'
                                } animate-pulse shadow-md`}></span>
                                <span className={`text-sm font-bold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {item.type}
                                </span>
                            </div>
                        </td>
                        </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default AdminDashboard;