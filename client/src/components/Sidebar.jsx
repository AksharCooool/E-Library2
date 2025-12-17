import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HouseDoor, Book, People, BoxArrowRight, Speedometer2, Megaphone, PersonCircle } from 'react-bootstrap-icons';

const Sidebar = () => {
  const location = useLocation();
  
  // Logic: Check if the current URL contains "/admin"
  const isAdmin = location.pathname.startsWith('/admin');

  // Helper for active link styling
  const isActive = (path) => location.pathname === path 
    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
    : "text-gray-400 hover:bg-white/10 hover:text-white";

  return (
    // ADDED: z-50 (to stay on top), backdrop-blur-xl (frost effect), border-r (subtle edge)
    <div className="h-screen w-64 bg-gray-900/90 backdrop-blur-xl text-white flex flex-col flex-shrink-0 transition-all duration-300 border-r border-white/10 z-50 relative">
      
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-blue-500/50 shadow-lg">E</div>
        <h2 className="text-xl font-bold tracking-wide">Library.io</h2>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
        
        {/* --- ADMIN LINKS --- */}
        {isAdmin ? (
            <>
                <li>
                  <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin')}`}>
                    <Speedometer2 size={20} />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/books" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/books')}`}>
                    <Book size={20} />
                    <span className="font-medium">Manage Books</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/users')}`}>
                    <People size={20} />
                    <span className="font-medium">Manage Users</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/manage-trending" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/manage-trending')}`}>
                    <Megaphone size={20} />
                    <span className="font-medium">Manage Trending</span>
                  </Link>
                </li>
            </>
        ) : (
            /* --- USER LINKS --- */
            <>
                <li>
                  <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard')}`}>
                    <Speedometer2 size={20} />
                    <span className="font-medium">My Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/home" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard/home')}`}>
                    <Book size={20} />
                    <span className="font-medium">Browse Library</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard/profile')}`}>
                    <PersonCircle size={20} />
                    <span className="font-medium">My Profile</span>
                  </Link>
                </li>
            </>
        )}

      </ul>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <BoxArrowRight size={20} />
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;