import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus, PencilSquare, Trash, Tags, X, Link45deg, 
  Magic, Search, Book, MoonStarsFill, SunFill, 
  CloudArrowUp, FileEarmarkPdf 
} from "react-bootstrap-icons";
import { motion, AnimatePresence } from 'framer-motion';
import FOG from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';

const ManageBooks = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Vanta State
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  const [categories, setCategories] = useState([
    "Fiction", "Non-Fiction", "Sci-Fi", "Tech", "History", "Self-Help"
  ]);

  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Upload Mode State: 'url' or 'file'
  const [uploadMode, setUploadMode] = useState('url'); 
  const [selectedFile, setSelectedFile] = useState(null);

  const [currentBook, setCurrentBook] = useState({
    _id: null,
    title: "",
    author: "",
    category: "Fiction",
    cover: "",
    pdfUrl: "",
    synopsis: "",
  });

  // --- EFFECTS ---

  // 1. Fetch Books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/books");
        setBooks(res.data);
      } catch (err) {
        toast.error("Failed to load books");
      }
    };
    fetchBooks();
  }, []);

  // 2. Initialize Vanta.js
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

  // 3. Handle Dark Mode Colors
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

  // --- HANDLERS ---

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBook({ ...currentBook, [name]: value });
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory)) {
      toast.error("Category already exists");
      return;
    }
    setCategories([...categories, newCategory]);
    setNewCategory("");
    toast.success("Category added");
  };

  const handleDeleteCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
    toast.success("Category removed");
  };

  const handleAIGenerate = () => {
    if (!currentBook.title) {
      toast.error("Enter book title first");
      return;
    }
    toast.loading("Generating...");
    setTimeout(() => {
      toast.dismiss();
      setCurrentBook((prev) => ({
        ...prev,
        synopsis: `AI generated synopsis for ${prev.title}. This is a simulated response.`,
      }));
      toast.success("Synopsis generated");
    }, 1500);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    
    // Create FormData object to handle both text and file data
    const formData = new FormData();
    formData.append('title', currentBook.title);
    formData.append('author', currentBook.author);
    formData.append('category', currentBook.category);
    formData.append('coverImage', currentBook.cover);
    formData.append('description', currentBook.synopsis);

    // Conditional Logic: Attach URL or File
    if (uploadMode === 'file' && selectedFile) {
        formData.append('pdfFile', selectedFile); // Backend must expect 'pdfFile'
        formData.append('pdfSource', 'file');
    } else {
        formData.append('pdfUrl', currentBook.pdfUrl);
        formData.append('pdfSource', 'url');
    }

    try {
      // NOTE: Your backend must be configured to handle 'multipart/form-data' 
      const { data } = await axios.post("http://localhost:5000/api/books", formData, {
          headers: { "Content-Type": "multipart/form-data" }
      });
      
      setBooks([...books, data]);
      toast.success("Book saved successfully");
      setShowBookModal(false);
      
      // Reset Form
      setCurrentBook({ ...currentBook, title: "", author: "", cover: "", pdfUrl: "", synopsis: "" });
      setSelectedFile(null);

    } catch (err) {
      console.error(err);
      toast.error("Failed to save book. Check server logs.");
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      setBooks(books.filter((b) => b._id !== id));
      toast.success("Book deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // --- UI ---
  return (
    <div className={`relative min-h-screen w-full transition-colors duration-500 font-sans ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      
      {/* Background Layer */}
      <div ref={vantaRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      {/* Content Layer */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative z-10 p-6 md:p-10 w-full max-w-7xl mx-auto"
      >
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-1">Library Inventory</h1>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your digital collection</p>
            </div>
            
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-3 rounded-xl backdrop-blur-md border transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                    {darkMode ? <SunFill /> : <MoonStarsFill />}
                </button>
                <button
                    onClick={() => setShowCategoryModal(true)}
                    className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 backdrop-blur-md border transition-all ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white/50 border-gray-200 hover:bg-white'}`}
                >
                    <Tags /> Categories
                </button>
                <button
                    onClick={() => setShowBookModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"
                >
                    <Plus size={20} /> Add Book
                </button>
            </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className={`p-1 rounded-2xl mb-8 flex items-center backdrop-blur-md border ${darkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/40 border-gray-200'}`}>
            <div className="p-3 pl-4 opacity-50"><Search /></div>
            <input
                type="text"
                placeholder="Search by title, author, or category..."
                className="w-full bg-transparent p-3 outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* TABLE */}
        <motion.div 
            layout
            className={`rounded-2xl overflow-hidden backdrop-blur-md border shadow-xl ${darkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white/60 border-gray-200'}`}
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={`text-xs font-bold uppercase tracking-wider border-b ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                            <th className="p-5 pl-8">Book Details</th>
                            <th className="p-5">Category</th>
                            <th className="p-5">Resources</th>
                            <th className="p-5 text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                        <AnimatePresence>
                            {filteredBooks.map((book) => (
                                <motion.tr 
                                    key={book._id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className={`group transition-colors ${darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-white/50'}`}
                                >
                                    <td className="p-5 pl-8 flex gap-4 items-center">
                                        <div className="w-12 h-16 rounded-lg overflow-hidden shadow-md bg-gray-200 shrink-0">
                                            <img src={book.coverImage || book.cover} alt={book.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg leading-tight">{book.title}</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                            {book.category}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {book.pdfUrl ? (
                                            <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1">
                                                <Link45deg /> PDF Linked
                                            </a>
                                        ) : (
                                            <span className="text-sm text-red-400 font-bold flex items-center gap-1"><X /> No PDF</span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right pr-8">
                                        <button 
                                            onClick={() => handleDeleteBook(book._id)}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredBooks.length === 0 && (
                    <div className="p-10 text-center opacity-50">No books found matching your search.</div>
                )}
            </div>
        </motion.div>

        {/* --- MODALS --- */}
        
        {/* ADD BOOK MODAL */}
        <AnimatePresence>
            {showBookModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl border flex flex-col max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Add New Book</h2>
                            <button onClick={() => setShowBookModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveBook} className="space-y-4">
                            {/* Title & Author */}
                            <div className="grid grid-cols-2 gap-4">
                                <input name="title" placeholder="Book Title" className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} onChange={handleInputChange} required />
                                <input name="author" placeholder="Author" className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} onChange={handleInputChange} required />
                            </div>
                            
                            {/* Category */}
                            <select name="category" className={`w-full p-3 rounded-xl border outline-none appearance-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} onChange={handleInputChange}>
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {/* Cover URL */}
                            <input name="cover" placeholder="Cover Image URL" className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} onChange={handleInputChange} />
                            
                            {/* --- PDF UPLOAD SWITCHER --- */}
                            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    <button type="button" onClick={() => setUploadMode('url')} className={`text-sm font-bold pb-2 ${uploadMode === 'url' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>
                                        Link URL
                                    </button>
                                    <button type="button" onClick={() => setUploadMode('file')} className={`text-sm font-bold pb-2 ${uploadMode === 'file' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>
                                        Upload PDF
                                    </button>
                                </div>

                                {uploadMode === 'url' ? (
                                    <input name="pdfUrl" placeholder="https://example.com/book.pdf" className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} onChange={handleInputChange} />
                                ) : (
                                    <div className="relative">
                                        <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-blue-400'}`}>
                                            <CloudArrowUp size={30} className="mb-2 text-blue-500" />
                                            {selectedFile ? (
                                                <span className="text-sm font-bold text-green-500 flex items-center gap-2"><FileEarmarkPdf /> {selectedFile.name}</span>
                                            ) : (
                                                <span className="text-sm text-gray-500">Click to upload PDF file</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Synopsis */}
                            <div className="relative">
                                <textarea name="synopsis" placeholder="Book Synopsis..." rows="3" className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} onChange={handleInputChange} />
                                <button type="button" onClick={handleAIGenerate} className="absolute bottom-3 right-3 text-xs font-bold text-purple-500 bg-purple-100 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-purple-200">
                                    <Magic /> Generate AI
                                </button>
                            </div>

                            <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-2">
                                Save Book
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* CATEGORY MODAL */}
        <AnimatePresence>
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Tags /> Manage Categories</h2>
                            <button onClick={() => setShowCategoryModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category..." className={`flex-1 p-2 rounded-xl border outline-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} />
                            <button className="bg-black text-white px-4 rounded-xl hover:bg-gray-800"><Plus size={24}/></button>
                        </form>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {categories.map((cat) => (
                                <div key={cat} className={`flex justify-between items-center p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                    <span className="font-medium text-sm">{cat}</span>
                                    <button onClick={() => handleDeleteCategory(cat)} className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors"><Trash /></button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default ManageBooks;