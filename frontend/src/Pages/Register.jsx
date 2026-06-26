import React, { useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import taskLogo from "../assets/tasklogo.png";
import { toast } from "react-hot-toast";

function Register({
  onRegisterSuccess,
  onNavigateToLogin,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "const API_URL = import.meta.env.VITE_API_URL;/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      toast.success(
        "Account Created Successfully "
      );

      onRegisterSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white border rounded-3xl p-8 shadow-sm flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 overflow-hidden relative shrink-0">
              <img
                src={taskLogo}
                alt="TaskFlow Logo"
                className="h-10 w-auto max-w-none absolute left-0 top-0"
              />
            </div>
            <span className="font-extrabold text-2xl text-slate-800 tracking-tight">TaskFlow</span>
          </div>

          <p className="text-sm text-slate-400 font-medium mt-2">
            Create your TaskFlow account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Full Name
            </label>

            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <FiUser />
              </div>

              <input
                type="text"
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Ritesh Kumar"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Email Address
            </label>

            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <FiMail />
              </div>

              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Password
            </label>

            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <FiLock />
              </div>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Choose a password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute inset-y-0 right-3 flex items-center text-slate-400"
              >
                {showPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800"
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 border-t pt-4">
          Already have an account?{" "}
          <button
            onClick={
              onNavigateToLogin
            }
            className="font-bold text-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;