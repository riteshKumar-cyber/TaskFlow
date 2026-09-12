// Backend Base URL with automatic production fallback for Render
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;

  // If online in browser, override localhost defaults or empty URL with live Render Backend
  const isOnline = typeof window !== "undefined" && 
                   window.location.hostname !== "localhost" && 
                   window.location.hostname !== "127.0.0.1";

  if (isOnline) {
    if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
      url = "https://taskflow-backend-ebz5.onrender.com";
    }
  }

  if (!url) {
    url = "http://localhost:5000";
  }

  return url.replace(/\/+$/, "");
};

const BASE_URL = `${getBaseUrl()}/api`;

// Helper function to get headers with the auth token
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

// 2. Mappers for Status alignment (Frontend <-> Backend)
// Frontend uses: 'todo', 'in-progress', 'done'
// Backend uses: 'To Do', 'In Progress', 'Done'
const toBackendStatus = (status) => {
  if (!status) return "To Do";
  const s = status.toLowerCase();
  if (s === "todo" || s === "to do") return "To Do";
  if (s === "in-progress" || s === "in progress" || s === "inprogress") return "In Progress";
  if (s === "done") return "Done";
  return "To Do";
};

const toFrontendStatus = (status) => {
  if (!status) return "todo";
  const s = status.toLowerCase();
  if (s === "to do" || s === "todo") return "todo";
  if (s === "in progress" || s === "in-progress" || s === "inprogress") return "in-progress";
  if (s === "done") return "done";
  return "todo";
};

// 3. Central object for all API calls
export const taskAPI = {
  // Register User
  registerUser: async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration Failed");
    }
    return data;
  },

  // Login User
  loginUser: async (credentials) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login Failed");
    }
    return data;
  },

  // Get All Tasks
  getAllTasks: async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "GET",
      headers: getHeaders()
    });
    const tasks = await res.json();
    return Array.isArray(tasks)
      ? tasks.map(t => ({ ...t, status: toFrontendStatus(t.status) }))
      : [];
  },

  // Create Task
  createTask: async (taskData) => {
    const dataToSend = {
      ...taskData,
      status: toBackendStatus(taskData.status)
    };
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(dataToSend)
    });
    const savedTask = await res.json();
    return {
      ...savedTask,
      status: toFrontendStatus(savedTask.status)
    };
  },

  // Update Task (status, details, etc.)
  updateTask: async (id, updatedData) => {
    const dataToSend = { ...updatedData };
    if (updatedData.status) {
      dataToSend.status = toBackendStatus(updatedData.status);
    }
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(dataToSend)
    });
    const updatedTask = await res.json();
    return {
      ...updatedTask,
      status: toFrontendStatus(updatedTask.status)
    };
  },

  // Delete Task
  deleteTask: async (id) => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return res.json();
  },

  // AI Suggestion for Estimate
  getAIEstimate: async (description, currentDate) => {
    const res = await fetch(`${BASE_URL}/ai/suggest`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ description, currentDate })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to generate AI suggestions");
    }
    return data;
  },

  // Update Password
  updatePassword: async (passwordData) => {
    const res = await fetch(`${BASE_URL}/auth/update-password`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(passwordData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update password");
    }
    return data;
  },

  // Update Profile Photo
  updateProfilePhoto: async (profilePhoto) => {
    const res = await fetch(`${BASE_URL}/auth/update-profile-photo`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ profilePhoto })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile photo");
    }
    return data;
  },

  // Delete Account
  deleteAccount: async () => {
    const res = await fetch(`${BASE_URL}/auth/delete-account`, {
      method: "DELETE",
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to delete account");
    }
    return data;
  },

  // Update Profile Details
  updateProfileDetails: async (details) => {
    const res = await fetch(`${BASE_URL}/auth/update-profile-details`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(details)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile details");
    }
    return data;
  }
};
