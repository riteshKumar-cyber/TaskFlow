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
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

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

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-350">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            {/* Soft decorative gradient blurs */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex flex-col gap-2 text-center items-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <FiMail className="text-xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Reset Password</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-[280px]">
                Enter your registered email address and we'll send you recovery instructions.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!forgotEmail.trim()) return;
                try {
                  setForgotLoading(true);
                  await new Promise((resolve) => setTimeout(resolve, 1200));
                  toast.success("Recovery email sent successfully!");
                  setShowForgotModal(false);
                  setForgotEmail("");
                } catch (err) {
                  toast.error("Failed to send recovery email");
                } finally {
                  setForgotLoading(false);
                }
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail("");
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-150 cursor-pointer border border-slate-200/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98] rounded-xl transition-all duration-150 shadow-md cursor-pointer"
                >
                  {forgotLoading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;