import React, { useState } from 'react';
import { FiSearch, FiPlus, FiBell, FiChevronDown, FiLogOut, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import taskLogo from '../assets/tasklogo.png';
import { toast } from 'react-hot-toast';
import { taskAPI } from '../services/api';

function Navbar({ onNewTaskClick, onLogout, searchQuery, setSearchQuery, onLogoClick, theme, onToggleTheme, profilePhoto, onProfilePhotoUpdate }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Failed to parse user info", error);
  }
  const userName = user.name || "User";
  const userEmail = user.email || "";

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const response = await taskAPI.updateProfilePhoto(base64String);
        // Update local storage
        const updatedUser = { ...user, profilePhoto: response.profilePhoto };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Update parent state
        if (onProfilePhotoUpdate) {
          onProfilePhotoUpdate(response.profilePhoto);
        }
        toast.success("Profile photo updated successfully ✅");
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to upload profile photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const initials = getInitials(userName);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-100/80 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Logo Section */}
      <button
        onClick={onLogoClick}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
        title="Go to Workspace"
      >
        <div className="w-8 h-8 overflow-hidden relative shrink-0">
          <img
            src={taskLogo}
            alt="TaskFlow Logo"
            className="h-8 w-auto max-w-none absolute left-0 top-0"
          />
        </div>
        <span className="hidden sm:inline font-bold text-lg text-slate-800 tracking-tight">TaskFlow</span>
      </button>

      {/* Search Bar */}
      <div className="hidden md:block flex-1 max-w-md mx-8 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <FiSearch className="text-sm" />
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          className="w-full bg-slate-50/50 border border-slate-200/80 text-slate-700 text-sm rounded-xl pl-9 pr-4 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* + New Task Button */}
        <button
          onClick={onNewTaskClick}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 active:scale-95 text-sm font-semibold p-2.5 md:px-4 md:py-2 rounded-xl cursor-pointer transition-all duration-150 shadow-sm"
          title="Create New Task"
        >
          <FiPlus className="text-lg shrink-0" />
          <span className="hidden md:inline">New Task</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 border border-transparent hover:border-slate-100 cursor-pointer transition-all duration-200"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <FiMoon className="text-lg text-yellow-400 fill-yellow-400/20" /> : <FiSun className="text-lg text-amber-500 fill-amber-500/20" />}
        </button>

        {/* Vertical divider */}
        <div className="hidden md:block w-px h-6 bg-slate-200" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl border border-transparent hover:border-slate-100 transition-all duration-200 text-left cursor-pointer"
          >
            {/* Custom Avatar Gradient or Image */}
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center border-2 border-white shadow-sm">
                {initials}
              </div>
            )}
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-700 leading-none">{userName}</div>
            </div>
            <FiChevronDown className={`text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2.5 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-1.5">
              <div className="border-b border-slate-100 pb-2 px-1">
                <p className="text-xs text-slate-400 font-medium"></p>
                <p className="text-sm font-semibold text-slate-700 truncate">{userEmail}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 font-semibold cursor-pointer hover:bg-rose-50/50 rounded-lg transition-colors w-full text-left"
              >
                <FiLogOut className="text-sm text-rose-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
