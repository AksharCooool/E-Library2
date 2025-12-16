import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../../axiosConfig'; // <--- UPDATED: Use your global config
import { motion, AnimatePresence } from 'framer-motion';
import { Person, Envelope, Lock, PersonCircle, ShieldLock, Key } from 'react-bootstrap-icons';

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [secretKey, setSecretKey] = useState('');
  
  // State for form fields
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      gender: 'male'
  });

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getButtonClass = (active) => {
    return active 
      ? "bg-gray-900 text-white shadow-md transform scale-105" 
      : "text-gray-500 hover:text-gray-900";                  
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend check
    if (role === 'admin' && !secretKey) {
      return toast.error("Please enter the Admin Secret Key");
    }

    try {
        // Send data to backend
        // Note: We use '/auth/register' because axiosConfig handles the 'http://localhost:5000/api' part
        const { data } = await axios.post('/auth/register', {
            ...formData,
            role: role,
            adminSecret: role === 'admin' ? secretKey : undefined 
        });
        
        toast.success("Account Created Successfully!");
        
        // Redirect to Login
        navigate('/login'); 

    } catch (error) {
        console.error("Registration Error:", error); // <--- CHECK CONSOLE FOR THIS
        
        // Extract exact message from server
        const msg = error.response?.data?.message || "Registration Failed. Check console for details.";
        toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden font-sans">
      
      {/* LEFT SIDE: IMAGE */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 relative bg-gray-900 justify-center items-center"
      >
        <img 
          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
          alt="Library Study" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 p-12 text-white max-w-lg">
            <h1 className="text-5xl font-bold mb-6">Join the Community</h1>
            <p className="text-lg text-gray-200 leading-relaxed">
                Start your journey today. Create an account to borrow books, track your reading history, and access exclusive content.
            </p>
        </div>
      </motion.div>

      {/* RIGHT SIDE: FORM */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-1/2 flex justify-center items-center p-8 relative"
      >
        <div className="absolute top-10 right-10 w-40 h-40 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-soft border border-gray-100">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2">Join us and start reading today.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-full inline-flex relative shadow-inner">
              <button type="button" onClick={() => setRole('user')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${getButtonClass(role === 'user')}`}>
                <PersonCircle /> User
              </button>
              <button type="button" onClick={() => setRole('admin')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${getButtonClass(role === 'admin')}`}>
                <ShieldLock /> Admin
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Full Name</label>
                <div className="relative">
                    <Person className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                    <input name="name" type="text" placeholder="John Doe" required value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all outline-none font-medium" />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email Address</label>
                <div className="relative">
                    <Envelope className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                    <input name="email" type="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all outline-none font-medium" />
                </div>
            </div>
            
            {/* Password */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                    <input name="password" type="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all outline-none font-medium" />
                </div>
            </div>

            {/* Gender Selection */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Gender</label>
                <div className="flex gap-4">
                    <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.gender === 'male' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="hidden" />
                        <span className="font-bold text-sm">Male</span>
                    </label>
                    <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.gender === 'female' ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="hidden" />
                        <span className="font-bold text-sm">Female</span>
                    </label>
                </div>
            </div>

            {/* Admin Key Slide Down */}
            <AnimatePresence>
                {role === 'admin' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <label className="block text-sm font-bold text-red-600 mb-1 ml-1">Admin Secret Key</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-3.5 text-red-400" size={18}/>
                            <input type="password" placeholder="Enter admin key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl bg-red-50 border border-red-200 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 transition-all outline-none font-medium text-red-900 placeholder-red-300" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-black transition-all duration-200 mt-2">
                {role === 'admin' ? 'Register as Admin' : 'Create Account'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 font-medium">
            Already have an account? <Link to="/login" className="font-bold text-gray-900 hover:underline">Log In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;