import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, StarFill, PlayFill, Heart, Share, 
  Book, Robot, Send, PersonCircle, Star 
} from 'react-bootstrap-icons';
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

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Reviews State
  const [reviews, setReviews] = useState([
    { id: 1, user: "Alice Johnson", rating: 5, comment: "Life changing book!", date: "2 days ago" },
    { id: 2, user: "Mark Spenser", rating: 4, comment: "Great but a bit repetitive.", date: "1 week ago" },
  ]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchBook = async () => {
      // 1. HANDLE PLACEHOLDER MANUALLY
      if (id === 'placeholder-1') {
        setBook({
            id: 'placeholder-1',
            title: "The Alchemist",
            author: "Paulo Coelho",
            category: "Fiction",
            coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
            backdrop: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800", // Using cover as backdrop for now
            rating: 4.8,
            reviews: 1540,
            pages: 208,
            description: "The Alchemist follows the journey of an Andalusian shepherd boy named Santiago. Believing a recurring dream to be prophetic, he asks a Romani fortune teller in a nearby town about its meaning. The woman interprets the dream as a prophecy telling the boy that he will discover a treasure at the Egyptian pyramids."
        });
        setLoading(false);
        return;
      }

      // 2. REAL API CALL
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook({
            ...res.data,
            id: res.data._id,
            coverImage: res.data.coverImage,
            backdrop: res.data.coverImage, // Fallback if no specific backdrop
            reviews: res.data.reviews || 120, 
            rating: res.data.rating || 4.8,
            pages: res.data.pages || 350
        });
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load book details");
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // --- HANDLERS ---
  const handleRead = () => navigate(`/dashboard/read/${id}`);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from Favorites" : "Added to Favorites");
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (userRating === 0) return toast.error("Please select a rating");
    if (!newComment.trim()) return toast.error("Please write a comment");

    const newReview = { 
        id: reviews.length + 1, 
        user: "You", 
        rating: userRating, 
        comment: newComment, 
        date: "Just now" 
    };
    
    setReviews([newReview, ...reviews]);
    setNewComment("");
    setUserRating(0);
    toast.success("Review Posted!");
  };

  if (loading) return <CustomLoader />;
  if (!book) return <div className="text-center mt-20">Book not found.</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-12">
      
      {/* --- BACKDROP HEADER --- */}
      <div className="h-80 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-gray-900/60 to-transparent z-10"></div>
        <img src={book.backdrop || book.coverImage} alt="Backdrop" className="w-full h-full object-cover" />
        
        {/* Back Button */}
        <motion.button 
            whileHover={{ x: -5 }}
            onClick={() => navigate(-1)} 
            className="absolute top-8 left-8 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white hover:text-black transition-all"
        >
            <ArrowLeft size={24} />
        </motion.button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* LEFT: COVER */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="md:col-span-1"
            >
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                    <img src={book.coverImage} alt={book.title} className="w-full h-auto object-cover" />
                </div>
            </motion.div>

            {/* RIGHT: DETAILS */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="md:col-span-2 pt-10 md:pt-16"
            >
                {/* Title Section */}
                <div className="mb-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                        {book.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight text-gray-900">{book.title}</h1>
                    <p className="text-xl text-gray-500 font-medium">by {book.author}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 py-6 border-y border-gray-100 mb-8">
                    <div className="flex items-center gap-2">
                        <StarFill className="text-yellow-400" size={24} />
                        <div>
                            <span className="font-bold text-xl block leading-none">{book.rating}</span>
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

                {/* Action Buttons */}
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
                        <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button className="px-6 py-4 border-2 border-gray-100 rounded-xl hover:border-blue-100 hover:bg-blue-50 hover:text-blue-500 text-gray-400 transition-colors">
                        <Share size={24} />
                    </button>
                </div>

                {/* Tabs */}
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
                                 {book.description}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="space-y-8"
                            >
                                {/* Review Form Block */}
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

                                {/* Review List Block */}
                                <div className="space-y-6">
                                    {reviews.map(r => (
                                        <div key={r.id} className="border-b border-gray-100 pb-6 last:border-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                                        <PersonCircle size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">{r.user}</h4>
                                                        <p className="text-xs text-gray-400">{r.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400 text-xs">
                                                    {[...Array(5)].map((_, i) => (
                                                        i < r.rating ? <StarFill key={i} /> : <Star key={i} className="text-gray-200" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm pl-14">{r.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
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