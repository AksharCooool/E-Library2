import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash, Search, PersonCircle, ShieldLock, Eye, X, Book, Star, Heart, Send } from 'react-bootstrap-icons';

const ManageUsers = () => {
  // Fake User Data
  const [users, setUsers] = useState([
    { 
      id: 1, name: "John Doe", email: "john@example.com", role: "User", status: "Active", joined: "2025-10-12", isOnline: true,
      stats: { booksRead: 12, reviews: 5, favorites: 8 } 
    },
    { 
      id: 2, name: "Admin User", email: "admin@library.io", role: "Admin", status: "Active", joined: "2025-09-01", isOnline: true,
      stats: { booksRead: 45, reviews: 12, favorites: 20 }
    },
    { 
      id: 3, name: "Jane Smith", email: "jane@test.com", role: "User", status: "Inactive", joined: "2025-11-05", isOnline: false,
      stats: { booksRead: 2, reviews: 0, favorites: 1 }
    },
    { 
      id: 4, name: "Mike Ross", email: "mike.ross@law.com", role: "User", status: "Active", joined: "2025-12-01", isOnline: false,
      stats: { booksRead: 8, reviews: 3, favorites: 5 }
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedUser, setSelectedUser] = useState(null); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false); // NEW
  const [messageText, setMessageText] = useState(""); // NEW

  // --- HANDLERS ---

  // 1. Delete User
  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to remove this user completely?")) {
        setUsers(users.filter(user => user.id !== id));
        toast.error('User removed successfully.');
    }
  };

  // 2. Ban / Activate Logic (Frontend Simulation)
  const handleToggleStatus = () => {
      if (!selectedUser) return;

      const newStatus = selectedUser.status === "Active" ? "Inactive" : "Active";
      
      // Update the local list
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u));
      
      // Update the selected user object too so the modal updates instantly
      setSelectedUser({ ...selectedUser, status: newStatus });

      toast.success(newStatus === "Inactive" ? "User Banned!" : "User Activated!");
  };

  // 3. Send Message Logic (Frontend Simulation)
  const handleSendMessage = (e) => {
      e.preventDefault();
      toast.success(`Message sent to ${selectedUser.name}`);
      setMessageText("");
      setShowMessageModal(false);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">View, manage, and monitor all registered members.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 flex gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search users by name or email..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Joined Date</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <PersonCircle size={24} />
                        </div>
                        {user.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            {user.name} 
                            {user.isOnline && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide font-bold">Online</span>}
                        </h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </td>
                <td className="p-4">
                   {user.role === "Admin" ? <span className="flex items-center gap-1 text-xs font-bold bg-black text-white px-3 py-1 rounded-full w-fit"><ShieldLock size={12} /> Admin</span> : <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">User</span>}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${user.status === "Active" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-red-50 text-red-600 border-red-200"}`}>{user.status}</span>
                </td>
                <td className="p-4 text-gray-600 font-medium">{user.joined}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleViewUser(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PROFILE MODAL --- */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg relative">
                <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24} /></button>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 relative">
                        <PersonCircle size={48} />
                        {selectedUser.isOnline && <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></span>}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <div className="mt-2 flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wide">{selectedUser.role}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${selectedUser.isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>{selectedUser.isOnline ? "Online Now" : "Offline"}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${selectedUser.status === "Active" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{selectedUser.status}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                        <div className="text-blue-600 mb-1 flex justify-center"><Book size={20} /></div>
                        <div className="text-2xl font-bold text-gray-900">{selectedUser.stats.booksRead}</div>
                        <div className="text-xs text-blue-600 font-bold uppercase">Read</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-2xl text-center border border-yellow-100">
                        <div className="text-yellow-600 mb-1 flex justify-center"><Star size={20} /></div>
                        <div className="text-2xl font-bold text-gray-900">{selectedUser.stats.reviews}</div>
                        <div className="text-xs text-yellow-600 font-bold uppercase">Reviews</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                        <div className="text-red-600 mb-1 flex justify-center"><Heart size={20} /></div>
                        <div className="text-2xl font-bold text-gray-900">{selectedUser.stats.favorites}</div>
                        <div className="text-xs text-red-600 font-bold uppercase">Favs</div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => { setShowProfileModal(false); setShowMessageModal(true); }}
                        className="flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1"
                    >
                        Send Message
                    </button>
                    <button 
                        onClick={handleToggleStatus}
                        className={`flex-1 py-3 border rounded-xl font-bold transition-colors ${
                            selectedUser.status === "Active" 
                            ? "bg-white border-red-200 text-red-600 hover:bg-red-50" 
                            : "bg-white border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                    >
                        {selectedUser.status === "Active" ? "Ban User" : "Activate User"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MESSAGE MODAL (NEW) --- */}
      {showMessageModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
             <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
                <button onClick={() => setShowMessageModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Send /> Message {selectedUser.name}</h2>
                
                <form onSubmit={handleSendMessage}>
                    <textarea 
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none h-32 resize-none mb-4"
                        placeholder="Type your message here..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg">
                        Send Notification
                    </button>
                </form>
             </div>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;