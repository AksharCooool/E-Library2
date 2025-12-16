import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Megaphone, Trash, CalendarEvent, Plus, ExclamationTriangle, InfoCircle } from 'react-bootstrap-icons';

const Announcements = () => {
  // Fake Data with 'type'
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Library Closed for Maintenance", content: "The library will be closed on Dec 25th for server upgrades.", date: "2025-12-14", type: "alert" },
    { id: 2, title: "New Books Arrived!", content: "Check out the new Sci-Fi collection available in the trending section.", date: "2025-12-10", type: "info" },
  ]);

  // Form State includes 'type' now
  const [newNotice, setNewNotice] = useState({ title: '', content: '', type: 'info' });

  const handlePost = (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    const notice = {
        id: announcements.length + 1,
        title: newNotice.title,
        content: newNotice.content,
        type: newNotice.type, // <--- Save the selected type
        date: new Date().toISOString().split('T')[0]
    };

    setAnnouncements([notice, ...announcements]); 
    setNewNotice({ title: '', content: '', type: 'info' }); // Reset form
    toast.success("Announcement posted!");
  };

  const handleDelete = (id) => {
    if(window.confirm("Delete this notice?")) {
        setAnnouncements(announcements.filter(a => a.id !== id));
        toast.success("Notice deleted.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 mt-1">Broadcast news and updates to all library users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Create Announcement Form */}
        <div className="lg:col-span-1 h-fit">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center">
                        <Megaphone size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Create New</h2>
                </div>

                <form onSubmit={handlePost} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Holiday Notice"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                            value={newNotice.title}
                            onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                            required
                        />
                    </div>
                    
                    {/* NEW: TYPE SELECTION */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notification Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setNewNotice({...newNotice, type: 'info'})}
                                className={`p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                                    newNotice.type === 'info' 
                                    ? "bg-blue-50 border-blue-500 text-blue-700" 
                                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <InfoCircle /> General Info
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewNotice({...newNotice, type: 'alert'})}
                                className={`p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                                    newNotice.type === 'alert' 
                                    ? "bg-red-50 border-red-500 text-red-700" 
                                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <ExclamationTriangle /> Critical Alert
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                        <textarea 
                            rows="4"
                            placeholder="Type your announcement here..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                            value={newNotice.content}
                            onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition-all flex justify-center items-center gap-2">
                        <Plus size={20} /> Post Notice
                    </button>
                </form>
            </div>
        </div>

        {/* RIGHT: List of Active Announcements */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Active Notices</h3>
            
            {announcements.map((notice) => (
                <div key={notice.id} className={`p-6 rounded-2xl shadow-sm border-l-4 relative group hover:shadow-md transition-all bg-white ${
                    notice.type === 'alert' ? 'border-red-500' : 'border-blue-500'
                }`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                             {/* Icon based on type */}
                            <div className={`p-2 rounded-full ${notice.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {notice.type === 'alert' ? <ExclamationTriangle /> : <InfoCircle />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                        </div>
                        <button 
                            onClick={() => handleDelete(notice.id)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                            <Trash size={18} />
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed ml-11">{notice.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium border-t border-gray-50 pt-4 ml-11">
                        <CalendarEvent /> Posted on {notice.date}
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ml-2 ${
                            notice.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {notice.type}
                        </span>
                    </div>
                </div>
            ))}

            {announcements.length === 0 && (
                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p>No active announcements.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Announcements;