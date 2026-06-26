import React, { useState } from "react";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Workspace from "./Pages/Workspace";
import { Toaster } from "react-hot-toast";

function App() {
  const [currentPage, setCurrentPage] = useState(
    localStorage.getItem("token")
      ? "workspace"
      : "login"
  );

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentPage("login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {currentPage === "login" && (
        <Login
          onLoginSuccess={() =>
            setCurrentPage("workspace")
          }
          onNavigateToRegister={() =>
            setCurrentPage("register")
          }
        />
      )}

      {currentPage === "register" && (
        <Register
          onRegisterSuccess={() =>
            setCurrentPage("workspace")
          }
          onNavigateToLogin={() =>
            setCurrentPage("login")
          }
        />
      )}

      {currentPage === "workspace" && (
        <Workspace
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;