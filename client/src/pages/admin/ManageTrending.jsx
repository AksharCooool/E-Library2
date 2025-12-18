import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import toast from 'react-hot-toast';
import { Star, StarFill, Search, Book, ArrowRight } from 'react-bootstrap-icons';

const ManageTrending = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch All Books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await axios.get('/books');
        setBooks(data);
        setLoading(false);
      } catch (err) {
        toast.error("Failed to load books");
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // 2. Toggle Trending Logic
  const handleToggleTrending = async (book) => {
    try {
      const { data } = await axios.put(`/books/${book._id}/trending`);
      
      // Update local state
      setBooks(books.map(b => b._id === book._id ? { ...b, isTrending: data.isTrending } : b));
      
      if (data.isTrending) {
          toast.success(`"${book.title}" is now Trending! 🔥`);
      } else {
          toast.success(`"${book.title}" removed from Trending.`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Filter books for the search list 
  const regularBooks = books.filter(b => 
    !b.isTrending && 
    (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     b.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const trendingBooks = books.filter(b => b.isTrending);

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trending Books</h1>
        <p className="text-gray-500 mt-1">Curate the "Hot & New" section for user homepages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT: CURRENTLY TRENDING --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <StarFill className="text-orange-500" /> Currently Trending ({trendingBooks.length})
            </h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {trendingBooks.length === 0 ? (
                    <div className="text-center p-8 text-gray-400 border border-dashed rounded-xl">
                        No books marked as trending.
                    </div>
                ) : (
                    trendingBooks.map(book => (
                        <div key={book._id} className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-100">
                            <div className="flex items-center gap-4">
                                <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded-md shadow-sm" />
                                <div>
                                    <h4 className="font-bold text-gray-900">{book.title}</h4>
                                    <p className="text-sm text-gray-500">{book.author}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggleTrending(book)}
                                className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* --- RIGHT: SEARCH & PROMOTE --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Book className="text-blue-600" /> Promote Books
            </h2>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search library..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? <p className="text-center text-gray-400">Loading...</p> : regularBooks.map(book => (
                    <div key={book._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                            <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded-md grayscale opacity-70 group-hover:grayscale-0" />
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">{book.title}</h4>
                                <p className="text-xs text-gray-500">{book.author}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleToggleTrending(book)}
                            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
                            title="Make Trending"
                        >
                            <Star size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ManageTrending;