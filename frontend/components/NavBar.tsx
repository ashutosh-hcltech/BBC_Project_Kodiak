import React from 'react';
import Image from 'next/image';

const NavBar = () => {
  return (
    <div className="flex flex-col items-center py-5 shadow-sm border-r border-gray-200 sticky top-0 left-0 h-screen overflow-y-auto bg-white w-[70px] flex-shrink-0">
      <div className="mb-8">
        <Image src="/BBC_Logo_2021.svg.png" alt="Company Logo" width={50} height={50} style={{ height: 'auto' }} />
      </div>
      <div className="nav-item flex justify-center items-center w-full h-[50px] mb-2 text-gray-600 relative cursor-pointer transition-colors duration-200 hover:bg-gray-100">
        <span className="material-icons text-2xl">dashboard</span>
      </div>
      <div className="nav-item flex justify-center items-center w-full h-[50px] mb-2 text-blue-600 bg-blue-50 relative cursor-pointer transition-colors duration-200 active-nav-item">
        <span className="material-icons text-2xl">build</span>
      </div>
      <div className="nav-item flex justify-center items-center w-full h-[50px] mb-2 text-gray-600 relative cursor-pointer transition-colors duration-200 hover:bg-gray-100">
        <span className="material-icons text-2xl">bar_chart</span>
      </div>
      <a href="/overrides" className="nav-item flex justify-center items-center w-full h-[50px] mb-2 text-gray-600 relative cursor-pointer transition-colors duration-200 hover:bg-gray-100">
        <span className="material-icons text-2xl">rule</span>
      </a>
      <div className="nav-item flex justify-center items-center w-full h-[50px] mb-2 mt-auto pt-5 text-gray-600 relative cursor-pointer transition-colors duration-200 hover:bg-gray-100">
        <span className="material-icons text-2xl">settings</span>
      </div>
      <div className="nav-item flex justify-center items-center w-full h-[50px] mb-2 text-gray-600 relative cursor-pointer transition-colors duration-200 hover:bg-gray-100">
        <span className="material-icons text-2xl">help_outline</span>
      </div>
      <div className="nav-item flex justify-center items-center w-full h-[50px] mb-2">
        <Image src="/avatar.png" alt="User Avatar" width={60} height={60} className="rounded-full" />
      </div>
      {/* Custom style for active nav item indicator */}
      <style jsx>{`
        .active-nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #007bff;
          border-top-right-radius: 2px;
          border-bottom-right-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default NavBar;