import React from 'react';

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">{pageTitle}</h1>
      <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
          <input
            type="text"
            placeholder="Search past assessments"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-base w-64 focus:outline-none focus:border-blue-500 transition-colors duration-200"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-base cursor-pointer transition-colors duration-200 hover:bg-gray-100">
          <span className="material-icons text-xl text-gray-600">filter_list</span>
          Filter
        </button>
      </div>
    </div>
  );
};

export default Header;