import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../../axiosConfig';
import { motion } from 'framer-motion';
import { Envelope, Lock, PersonCircle, ArrowRight } from 'react-bootstrap-icons';

const Login = () => {
  const navigate = useNavigate();
  
  // State
  const [formData, setFormData] = useState({
      email: '',
      password: ''
  });
  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /// Handle Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/auth/login', formData);

      localStorage.setItem('userInfo', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token
      }));

      toast.success(`Welcome back, ${data.name}!`);

      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard/home');
      }

    } catch (error) {
      console.error(error);
      
      if (error.response && error.response.status === 403) {
          return; 
      }

      // Handle normal errors 
      const message = error.response?.data?.message || "Login Failed";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden font-sans">
      
      {/* --- LEFT SIDE: IMAGE --- */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 relative bg-gray-900 justify-center items-center overflow-hidden"
      >
        <img 
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        
        <div className="relative z-10 p-12 text-white max-w-lg">
            <h1 className="text-5xl font-bold mb-6">Welcome Back</h1>
            <p className="text-lg text-gray-200 leading-relaxed">
                Unlock a world of knowledge. Access your collection, manage your favorites, and pick up right where you left off.
            </p>
        </div>
      </motion.div>


      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-1/2 flex justify-center items-center p-8 relative"
      >
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-soft border border-gray-100">
          
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <PersonCircle size={28} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Log In</h2>
            <p className="text-gray-500 mt-2">Please enter your details to continue.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email Address</label>
                <div className="relative group">
                    <Envelope className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18}/>
                    <input 
                        name="email"
                        type="email" 
                        placeholder="you@example.com" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium" 
                    />
                </div>
            </div>
            
            {/* Password */}
            <div>
                <div className="flex justify-between items-center mb-1 ml-1">
                    <label className="block text-sm font-bold text-gray-700">Password</label>
                    <Link to="/forgot-password" class="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18}/>
                    <input 
                        name="password"
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium" 
                    />
                </div>
            </div>
            
            {/* Submit Button */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-black transition-all duration-200 flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? 'Verifying...' : <>Sign In <ArrowRight /></>}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 font-medium">
            Don't have an account? <Link to="/signup" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;