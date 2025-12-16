import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Left Side - Hero Image (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 justify-center items-center overflow-hidden">
         {/* Background Image with Overlay */}
         <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 hover:scale-105 transition-transform duration-[2s]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507842217121-9e93ca0a5052?q=80&w=1920&auto=format&fit=crop')" }}
         ></div>
         
         {/* Text Over Image */}
         <div className="relative z-10 p-12 text-white max-w-lg">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">Welcome back to <span className="text-blue-400">Library.io</span></h1>
            <p className="text-lg text-gray-300">Discover a world of knowledge with our modern digital library management system. Borrow, read, and grow.</p>
         </div>
      </div>

      {/* Right Side - The Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
            <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;