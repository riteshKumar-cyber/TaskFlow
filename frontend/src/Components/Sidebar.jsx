import React, { useState } from 'react';
import { 
  FiHome, 
  FiGrid, 
  FiSettings, 
  FiMenu,
  FiChevronDown
} from 'react-icons/fi';

function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', icon: FiHome, label: 'Dashboard' },
    { id: 'workspace', icon: FiGrid, label: 'Workspace' },
    { id: 'settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col bg-white border-r border-slate-150 h-screen w-16 shrink-0 transition-all duration-300 sticky top-0 z-40">
        {/* Top spacing matches navbar height with toggle button */}
        <div className="h-16 flex items-center justify-center border-b border-slate-100 shrink-0">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 cursor-pointer flex items-center justify-center ${isMenuOpen ? 'bg-blue-50/50 text-blue-600' : ''}`}
            title="Toggle Menu"
          >
            <FiMenu className="text-xl" />
          </button>
        </div>

        {/* Menu items dropdown (vertical single line) */}
        <div className={`flex flex-col pt-6 pb-2 space-y-2 transition-all duration-300 overflow-hidden shrink-0 ${isMenuOpen ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 pt-0 pb-0'}`}>
          <nav className="px-0 space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center w-12 h-12 justify-center rounded-2xl mx-auto transition-all duration-200 group relative cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  title={item.label}
                >
                  <IconComponent className={`text-lg shrink-0 ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  
                  {/* Left active vertical line */}
                  {isActive && (
                    <div className="absolute left-0 top-3.5 bottom-3.5 w-1.5 bg-blue-600 rounded-r-md transition-all" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Arrow indicator aligned left, sitting right below the settings menu items */}
        {isMenuOpen && (
          <div className="px-4 py-2 flex items-center justify-start shrink-0 w-full animate-in fade-in duration-200">
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer flex items-center justify-center"
              title="Collapse Menu"
            >
              <FiChevronDown className="text-lg" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-slate-150/80 items-center justify-around z-40 px-6 shadow-lg shadow-slate-950/5">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <IconComponent className="text-xl shrink-0" />
              <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default Sidebar;
