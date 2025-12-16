import React, { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axiosConfig"; 
import { ArrowLeft, StarFill, PlayFill, Heart, Share, Book, Robot, Send, PersonCircle, Star, HeartFill } from 'react-bootstrap-icons';
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';

// --- CUSTOM LOADER ---
const CustomLoader = () => (
  <div className="flex flex-col justify-center items-center h-screen w-full bg-white z-50">
    <motion.div 
      animate={{ rotateY: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="text-gray-900 mb-6"
    >
      <Book size={60} />
    </motion.div>
    <p className="text-gray-400 font-bold tracking-widest text-xs animate-pulse">FETCHING BOOK...</p>
  </div>
);

// --- ISOLATED REVIEW COMPONENT (Fixes Typing Lag) ---
const ReviewSection = memo(({ bookId, reviews, onReviewAdded }) => {
    const [newComment, setNewComment] = useState("");
    const [userRating, setUserRating] = useState(0);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (userRating === 0) return toast.error("Please select a rating");
        if (!newComment.trim()) return toast.error("Please write a comment");
    
        try {
            await axios.post(`/books/${bookId}/reviews`, { rating: userRating, comment: newComment });
            toast.success("Review Posted!");
            setNewComment("");
            setUserRating(0);
            onReviewAdded(); // Trigger refresh in parent
        } catch (error) {
            toast.error(error.response?.data?.message || "Error posting review");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-8"
        >
            <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                    <div className="flex gap-2 mb-4">
                        {[1,2,3,4,5].map(star => (
                            <button key={star} type="button" onClick={() => setUserRating(star)} className="transition-transform hover:scale-110">
                                <StarFill size={20} className={userRating >= star ? "text-yellow-400" : "text-gray-300"} />
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="w-full p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-gray-900 outline-none bg-white"
                        placeholder="Share your thoughts..."
                        rows="3"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black transition-colors">
                        <Send size={14} /> Post
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                {(!reviews || reviews.length === 0) && (
                    <p className="text-gray-400 italic">No reviews yet.</p>
                )}
                
                {reviews && reviews.map(r => (
                    <div key={r._id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                    <PersonCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{r.name}</h4> 
                                    <p className="text-xs text-gray-400">{r.createdAt?.substring(0, 10)}</p>
                                </div>
                            </div>
                            <div className="flex text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => (
                                    // 👇 The Fix: Removed the extra '<' at the start
                                    i < r.rating ? <StarFill key={i} /> : <Star key={i} className="text-gray-200" />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm pl-14">{r.comment}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); 
  const [isFavorite, setIsFavorite] = useState(false);

  // Function to fetch book (reused for updates)
  const fetchBookData = async () => {
    const { data } = await axios.get(`/books/${id}`);
    return data;
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // PARALLEL FETCHING (Faster Load)
        const [bookData, favRes] = await Promise.all([
            fetchBookData(),
            axios.get('/users/favorites').catch(() => ({ data: [] })) // Handle error gracefully
        ]);

        setBook(bookData);
        
        // Check favorites
        const favIds = (favRes.data || []).map(b => b._id || b);
        if (favIds.includes(bookData._id)) setIsFavorite(true);

      } catch (error) {
        console.error(error);
        toast.error("Failed to load book details");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleReviewAdded = async () => {
      const updatedBook = await fetchBookData();
      setBook(updatedBook);
  };

  const handleRead = () => {
     navigate(`/dashboard/read/${book._id}`);
  };
  
  const toggleFavorite = async () => {
    try {
        await axios.put(`/users/favorites/${book._id}`);
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? "Removed from Favorites" : "Added to Favorites");
    } catch (error) {
        toast.error("Error updating favorites");
    }
  };

  if (loading) return <CustomLoader />;
  if (!book) return <div className="text-center mt-20">Book not found.</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-12">
      
      {/* --- BACKDROP HEADER --- */}
      <div className="h-80 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-gray-900/60 to-transparent z-10"></div>
        <img 
          src={book.coverImage} 
          alt="Backdrop" 
          loading="lazy"
          className="w-full h-full object-cover" 
          onError={(e) => { e.target.src = "https://via.placeholder.com/1200x400?text=No+Image"; }} 
        />
        
        <motion.button 
            whileHover={{ x: -5 }}
            onClick={() => navigate(-1)} 
            className="absolute top-8 left-8 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white hover:text-black transition-all"
        >
            <ArrowLeft size={24} />
        </motion.button>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* LEFT: COVER */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="md:col-span-1"
            >
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      loading="lazy"
                      className="w-full h-auto object-cover aspect-[2/3]" 
                      onError={(e) => { e.target.src = "https://via.placeholder.com/300x450?text=No+Cover"; }}
                    />
                </div>
            </motion.div>

            {/* RIGHT: DETAILS */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="md:col-span-2 pt-10 md:pt-16"
            >
                <div className="mb-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                        {book.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight text-gray-900">{book.title}</h1>
                    <p className="text-xl text-gray-500 font-medium">by {book.author}</p>
                </div>

                <div className="flex items-center gap-8 py-6 border-y border-gray-100 mb-8">
                    <div className="flex items-center gap-2">
                        <StarFill className="text-yellow-400" size={24} />
                        <div>
                            <span className="font-bold text-xl block leading-none">{book.rating ? book.rating.toFixed(1) : 0}</span>
                            <span className="text-gray-400 text-xs font-bold">Rating</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <Book className="text-blue-500" size={24} />
                        <div>
                            <span className="font-bold text-xl block leading-none">{book.pages}</span>
                            <span className="text-gray-400 text-xs font-bold">Pages</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-12">
                    <button 
                        onClick={handleRead}
                        className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:scale-105 transition-all flex justify-center items-center gap-3"
                    >
                        <PlayFill size={24} /> Read Now
                    </button>
                    <button 
                        onClick={toggleFavorite}
                        className={`px-6 py-4 border-2 rounded-xl transition-colors ${
                            isFavorite 
                            ? 'border-red-100 bg-red-50 text-red-500' 
                            : 'border-gray-100 hover:border-red-100 hover:bg-red-50 hover:text-red-500 text-gray-400'
                        }`}
                    >
                        {isFavorite ? <HeartFill size={24} /> : <Heart size={24} />}
                    </button>
                    <button className="px-6 py-4 border-2 border-gray-100 rounded-xl hover:border-blue-100 hover:bg-blue-50 hover:text-blue-500 text-gray-400 transition-colors">
                        <Share size={24} />
                    </button>
                </div>

                {/* TABS */}
                <div>
                    <div className="flex gap-8 border-b border-gray-100 mb-6">
                        {['overview', 'reviews'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)} 
                                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                                    activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab}
                                {activeTab === tab && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' ? (
                            <motion.div 
                                key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-gray-600 leading-relaxed text-lg"
                            >
                                 <div className="flex items-center gap-2 mb-4 text-purple-600 font-bold text-xs uppercase tracking-widest">
                                    <Robot /> AI Generated Synopsis
                                 </div>
                                 {book.description || "No description available."}
                            </motion.div>
                        ) : (
                            // RENDER THE ISOLATED COMPONENT HERE
                            <ReviewSection 
                                bookId={book._id} 
                                reviews={book.reviews} 
                                onReviewAdded={handleReviewAdded} 
                            />
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;