import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      
      {/* 1. Sidebar  */}
      <Sidebar />

      {/* 2. Main Content */}
      <div className="flex-1 h-full overflow-y-auto relative z-10">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
           <Outlet /> 
        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;