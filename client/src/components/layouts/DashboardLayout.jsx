import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';

const DashboardLayout = () => {
  return (
    // Changed "bg-gray-50" to "bg-transparent" or removed it so the Vanta background shows through
    <div className="flex h-screen w-full overflow-hidden relative">
      
      {/* 1. Sidebar (Now has z-50 to sit ON TOP of the animation) */}
      <Sidebar />

      {/* 2. Main Content */}
      <div className="flex-1 h-full overflow-y-auto relative z-10">
        {/* We remove the padding restriction here to let full-width pages breathe if needed, 
            but keeping your original padding logic inside the container is fine. */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
           <Outlet /> 
        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;