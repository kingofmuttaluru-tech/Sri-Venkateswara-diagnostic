
import React from 'react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, isLoggedIn, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-teal-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <i className="fas fa-microscope text-2xl mr-2"></i>
            <span className="font-bold text-lg hidden sm:block">Sri Venkateswara Diagnostic</span>
            <span className="font-bold text-lg sm:hidden">SV Diagnostic</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <button 
              onClick={() => onNavigate('home')} 
              className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'home' ? 'bg-teal-900' : 'hover:bg-teal-700'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('booking')} 
              className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'booking' ? 'bg-teal-900' : 'hover:bg-teal-700'}`}
            >
              Book Test
            </button>
            <button 
              onClick={() => onNavigate('reports')} 
              className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'reports' ? 'bg-teal-900' : 'hover:bg-teal-700'}`}
            >
              Reports
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <button 
                onClick={onLogout}
                className="bg-white text-teal-800 px-4 py-1 rounded-full text-sm font-semibold hover:bg-slate-100 transition"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('reports')}
                className="bg-white text-teal-800 px-4 py-1 rounded-full text-sm font-semibold hover:bg-slate-100 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
