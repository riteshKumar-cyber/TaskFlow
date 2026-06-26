import React, { useState } from 'react';
import { FiX, FiEye, FiEyeOff, FiLogOut, FiLock } from 'react-icons/fi';
import { taskAPI } from "../services/api";
import { toast } from 'react-hot-toast';

function Settings({ onLogout, profilePhoto, onProfilePhotoUpdate }) {
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  
  const [editName, setEditName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").name || "";
    } catch (e) {
      return "";
    }
  });

  const [editEmail, setEditEmail] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").email || "";
    } catch (e) {
      return "";
    }
  });

  // 3-Step Password Change Wizard States
  const [pwStep, setPwStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [pwError, setPwError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete Account States
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const getLoggedInUserInitials = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.name) {
        const parts = user.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.name.slice(0, 2).toUpperCase();
      }
    } catch (e) {}
    return "RK";
  };

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
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...user, profilePhoto: response.profilePhoto };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Update parent state
        onProfilePhotoUpdate(response.profilePhoto);
        toast.success("Profile photo updated successfully ✅");
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to upload profile photo");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 w-full bg-white border border-slate-150 rounded-3xl p-4 sm:p-8 shadow-sm flex flex-col gap-8 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-3xl w-full flex flex-col gap-8">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Account Settings</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Manage your profile details and avatar settings</p>
          </div>
          
          {/* Save Changes button */}
          {isEditingDetails && (
            <button
              onClick={async () => {
                if (!editName.trim() || !editEmail.trim()) {
                  toast.error("Name and Email cannot be empty");
                  return;
                }
                try {
                  setProfileUpdating(true);
                  const response = await taskAPI.updateProfileDetails({ name: editName, email: editEmail });
                  
                  // Update local storage
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  const updatedUser = { ...user, name: response.user.name, email: response.user.email };
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                  
                  toast.success("Profile details updated successfully ");
                  setIsEditingDetails(false);
                } catch (err) {
                  toast.error(err.message || "Failed to update profile details");
                } finally {
                  setProfileUpdating(false);
                }
              }}
              disabled={profileUpdating}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 active:scale-98 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 animate-in fade-in duration-200"
            >
              {profileUpdating ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {/* Profile Settings Content Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Avatar upload */}
          <div className="flex flex-col items-center text-center p-6 bg-slate-50/50 border border-slate-200/50 rounded-2xl gap-4">
            <div className="relative group">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md transition-transform duration-200 group-hover:scale-102"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md border-4 border-white">
                  {getLoggedInUserInitials()}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-1 w-full">
              <h4 className="text-sm font-bold text-slate-800">Profile Photo</h4>
              <p className="text-[10px] text-slate-400 font-medium">PNG or JPG up to 2MB</p>
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              <label className="w-full text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl py-2.5 cursor-pointer shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
                <span>Upload Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
              </label>
              {profilePhoto && (
                <button 
                  onClick={async () => {
                    try {
                      await taskAPI.updateProfilePhoto("");
                      const user = JSON.parse(localStorage.getItem("user") || "{}");
                      const updatedUser = { ...user, profilePhoto: "" };
                      localStorage.setItem("user", JSON.stringify(updatedUser));
                      onProfilePhotoUpdate("");
                      toast.success("Profile photo removed successfully ");
                    } catch (err) {
                      toast.error(err.message || "Failed to remove photo");
                    }
                  }}
                  className="w-full text-center text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent rounded-xl py-2 transition-all cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Right Columns: Profile Fields Details */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800">Personal Details</h3>
              <button
                type="button"
                onClick={() => {
                  if (isEditingDetails) {
                    try {
                      const user = JSON.parse(localStorage.getItem("user") || "{}");
                      setEditName(user.name || "");
                      setEditEmail(user.email || "");
                    } catch (e) {}
                  }
                  setIsEditingDetails(!isEditingDetails);
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all border ${
                  isEditingDetails
                    ? 'text-rose-600 bg-rose-50/50 hover:bg-rose-50 border-rose-100'
                    : 'text-blue-600 bg-blue-50/50 hover:bg-blue-50 border-blue-100'
                }`}
              >
                {isEditingDetails ? "Cancel" : "Edit Details"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  readOnly={!isEditingDetails}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full text-sm rounded-xl px-4 py-3 font-semibold transition-all ${
                    isEditingDetails
                      ? 'bg-slate-50 border border-slate-200/60 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500'
                      : 'bg-slate-50/30 border border-slate-100/50 text-slate-500 cursor-default select-all'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  readOnly={!isEditingDetails}
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`w-full text-sm rounded-xl px-4 py-3 font-semibold transition-all ${
                    isEditingDetails
                      ? 'bg-slate-50 border border-slate-200/60 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500'
                      : 'bg-slate-50/30 border border-slate-100/50 text-slate-500 cursor-default select-all'
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-slate-50/30 border border-slate-100 rounded-xl p-4 mt-2">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Workspace Role</div>
              <div className="text-xs font-bold text-slate-600">Member</div>
            </div>

            {/* 3-Step Password Change Wizard */}
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-6 mt-4 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Change Password</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-sans">Securely update your password in 3 easy steps</p>
              </div>

              {/* Step Indicator Header */}
              <div className="flex items-center justify-between w-full border-b border-slate-200/55 pb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pwStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
                  <span className={`text-[11px] font-bold ${pwStep === 1 ? 'text-blue-600' : 'text-slate-500'}`}>Verify</span>
                </div>
                <div className="w-3 sm:w-8 h-px bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pwStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
                  <span className={`text-[11px] font-bold ${pwStep === 2 ? 'text-blue-600' : 'text-slate-500'}`}>New Password</span>
                </div>
                <div className="w-3 sm:w-8 h-px bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pwStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
                  <span className={`text-[11px] font-bold ${pwStep === 3 ? 'text-blue-600' : 'text-slate-500'}`}>Confirm</span>
                </div>
              </div>

              {/* Error Box */}
              {pwError && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-2 text-[11px] font-semibold text-rose-600">
                  {pwError}
                </div>
              )}

              {/* Success Box */}
              {passwordSuccess ? (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-6 text-center flex flex-col items-center gap-2 animate-in fade-in duration-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">✓</div>
                  <div className="text-xs font-bold text-emerald-800">Password Updated Successfully!</div>
                  <div className="text-[10px] text-slate-400 font-medium">Your credentials have been updated.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Step 1 Content */}
                  {pwStep === 1 && (
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setPwError('');
                          }}
                          className="w-full bg-white border border-slate-200/80 text-slate-700 text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showCurrentPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 Content */}
                  {pwStep === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setPwError('');
                            }}
                            className="w-full bg-white border border-slate-200/80 text-slate-700 text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showNewPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-type new password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setPwError('');
                            }}
                            className="w-full bg-white border border-slate-200/80 text-slate-700 text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 Content */}
                  {pwStep === 3 && (
                    <div className="bg-blue-50/20 border border-blue-100 rounded-xl p-4 flex flex-col gap-2 text-left">
                      <h4 className="text-xs font-bold text-slate-800">Please Confirm Password Update</h4>
                      <p className="text-[11px] text-slate-400 font-medium font-sans">You are changing your login password. Next time you login, you must use your new credentials.</p>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="confirmCheckbox"
                          className="w-4 h-4 text-blue-600 bg-white border-slate-200 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="confirmCheckbox" className="text-[11px] font-bold text-slate-600 select-none cursor-pointer">
                          I confirm I want to change my password.
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Footer Action Buttons */}
                  <div className="flex justify-end gap-3 mt-2">
                    {pwStep > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPwStep(pwStep - 1);
                          setPwError('');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      >
                        Back
                      </button>
                    )}
                    {pwStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (pwStep === 1) {
                            if (!currentPassword) {
                              setPwError('Current password is required');
                              return;
                            }
                            setPwStep(2);
                          } else if (pwStep === 2) {
                            if (!newPassword || !confirmPassword) {
                              setPwError('All fields are required');
                              return;
                            }
                            if (newPassword.length < 6) {
                              setPwError('New password must be at least 6 characters');
                              return;
                            }
                            if (newPassword !== confirmPassword) {
                              setPwError('New passwords do not match');
                              return;
                            }
                            if (newPassword === currentPassword) {
                              setPwError('New password cannot be same as current password');
                              return;
                            }
                            setPwStep(3);
                          }
                        }}
                        className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={passwordUpdating}
                        onClick={async () => {
                          const confirmChk = document.getElementById("confirmCheckbox");
                          if (!confirmChk || !confirmChk.checked) {
                            setPwError('Please check the confirmation box to proceed');
                            return;
                          }
                          
                          try {
                            setPasswordUpdating(true);
                            await taskAPI.updatePassword({ currentPassword, newPassword });
                            setPwError('');
                            setPasswordSuccess(true);
                            toast.success("Password updated successfully ✅");
                            // Reset fields after success
                            setTimeout(() => {
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                              setPwStep(1);
                              setPasswordSuccess(false);
                            }, 3000);
                          } catch (err) {
                            setPwError(err.message || 'Failed to update password');
                            toast.error(err.message || 'Failed to update password');
                          } finally {
                            setPasswordUpdating(false);
                          }
                        }}
                        className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {passwordUpdating ? 'Updating...' : 'Confirm & Update'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account Option */}
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 sm:p-6 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-4">
              <div className="flex flex-col gap-0.5 text-left">
                <h3 className="text-sm font-bold text-slate-800">Delete Account</h3>
                <p className="text-[11px] text-slate-400 font-medium">Permanently remove your profile and workspace tasks</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(true)}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
              >
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* CUSTOM BEAUTIFUL DELETE ACCOUNT DIALOG */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-350">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            {/* Soft decorative gradient blurs */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                <FiX className="text-2xl" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Delete Account Permanently?</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[280px]">
                  This action is irreversible. All your tasks and account details will be permanently deleted.
                </p>
                <p className="text-rose-600 text-[10px] font-bold mt-1">
                  Type your email <span className="underline">{JSON.parse(localStorage.getItem("user") || "{}").email}</span> to confirm.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <input
                type="text"
                placeholder="Confirm your email address"
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteConfirmEmail('');
                }}
                className="flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-150 cursor-pointer border border-slate-200/60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteAccountLoading}
                onClick={async () => {
                  const userEmail = JSON.parse(localStorage.getItem("user") || "{}").email || "";
                  if (deleteConfirmEmail.trim().toLowerCase() !== userEmail.trim().toLowerCase()) {
                    toast.error("Email address does not match");
                    return;
                  }
                  
                  try {
                    setDeleteAccountLoading(true);
                    await taskAPI.deleteAccount();
                    toast.success("Account deleted successfully ✅");
                    setShowDeleteAccountModal(false);
                    setDeleteConfirmEmail('');
                    if (onLogout) {
                      onLogout();
                    }
                  } catch (err) {
                    toast.error(err.message || "Failed to delete account");
                  } finally {
                    setDeleteAccountLoading(false);
                  }
                }}
                className="flex-1 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] rounded-xl transition-all duration-150 shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
              >
                {deleteAccountLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
