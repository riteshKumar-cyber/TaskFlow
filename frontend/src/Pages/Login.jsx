import React, { useState } from "react";
import axios from "axios";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import taskLogo from "../assets/tasklogo.png";
import { toast } from "react-hot-toast";

function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(res.data)
      );

      toast.success("Login Successful ");

      onLoginSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white border rounded-3xl p-8 shadow-sm flex flex-col gap-6">

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
            Simplify your workspace and boost collaboration
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
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
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t pt-4">
          Don't have an account?{" "}
          <button
            onClick={onNavigateToRegister}
            className="font-bold text-blue-600"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;