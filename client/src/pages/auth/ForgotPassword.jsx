import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Envelope, ArrowLeft, Key } from 'react-bootstrap-icons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if(!email) {
        toast.error("Please enter your email address");
        return;
    }

    // Fake Logic: Simulate server request
    const toastId = toast.loading("Sending reset link...");
    
    setTimeout(() => {
        toast.dismiss(toastId);
        toast.success("Reset link sent! Check your inbox.");
        setEmail(''); // Clear the input
    }, 1500);
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
          src="https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
          alt="Books" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 p-12 text-white max-w-lg glass-panel shadow-strong">
            <h1 className="text-4xl font-bold mb-4">Forgot Password?</h1>
            <p className="text-lg text-gray-200 leading-relaxed">
                It happens to the best of us. Enter your email address and we'll send you a link to reset your password and get you back to reading.
            </p>
        </div>
      </motion.div>


      {/* --- RIGHT SIDE: FORM --- */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-1/2 flex justify-center items-center p-8 relative"
      >
        {/* Decorative background blobs */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-soft border border-gray-100">
          
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Key size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-500 mt-2">Enter your email to receive instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email Address</label>
                <div className="relative">
                    <Envelope className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                    <input 
                        type="email" 
                        placeholder="Enter your registered email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all outline-none font-medium" 
                    />
                </div>
            </div>
            
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-black transition-all duration-200"
            >
                Send Reset Link
            </motion.button>
          </form>

          <div className="mt-8 text-center">
             <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:underline transition-colors">
                <ArrowLeft size={16} /> Back to Login
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;