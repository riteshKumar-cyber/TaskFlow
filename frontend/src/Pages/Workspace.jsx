import React, { useEffect, useState } from 'react';
import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';
import Boardview from '../Components/Boardview';
import Dashboard from '../Components/Dashboard';
import FocusTasks from '../Components/FocusTasks';
import Settings from '../Components/Settings';
import TaskModal from '../Components/TaskModal';
import { FiX } from 'react-icons/fi';
import { taskAPI } from "../services/api";
import { toast } from 'react-hot-toast';

function Workspace({ onLogout, theme, toggleTheme }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").profilePhoto || "";
    } catch (e) {
      return "";
    }
  });

  const [currentTab, setCurrentTab] = useState('workspace');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (task.title && task.title.toLowerCase().includes(query)) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  });

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  // Load tasks from database on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskAPI.getAllTasks();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load tasks from database:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // Sync drag-and-drop status update
  const handleTaskDropped = async (taskId, newStatus) => {
    const originalTasks = [...tasks];

    // Update UI optimistically
    setTasks((prevTasks) =>
      prevTasks.map((t) => ((t._id || t.id) === taskId ? { ...t, status: newStatus } : t))
    );

    // Update backend
    try {
      await taskAPI.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error("Backend update failed, rolling back:", err);
      setTasks(originalTasks);
    }
  };

  // Field updater
  const handleUpdateTask = async (taskId, updatedFields) => {
    const originalTasks = [...tasks];

    setTasks((prevTasks) =>
      prevTasks.map((t) => ((t._id || t.id) === taskId ? { ...t, ...updatedFields } : t))
    );

    try {
      await taskAPI.updateTask(taskId, updatedFields);
      toast.success("Task updated successfully");
    } catch (err) {
      console.error("Task update failed, rolling back:", err);
      setTasks(originalTasks);
      toast.error("Failed to update task.");
    }
  };

  // Show delete confirmation modal
  const handleDeleteTask = (taskId) => {
    setDeleteConfirmTaskId(taskId);
  };

  // Save task
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const taskId = editingTask._id || editingTask.id;
        const updatedTask = await taskAPI.updateTask(taskId, taskData);
        setTasks((prev) => prev.map((t) => (t._id || t.id) === taskId ? updatedTask : t));
        toast.success("Task updated successfully");
      } else {
        const savedTask = await taskAPI.createTask({
          ...taskData,
          status: 'todo', // Default status
        });
        setTasks((prev) => [savedTask, ...prev]);
        toast.success("Task created successfully");
      }
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to save task.");
      console.error("Failed to save or update task:", err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar currentPage={currentTab} setCurrentPage={setCurrentTab} onLogout={onLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onNewTaskClick={handleOpenNewTask} 
          onLogout={onLogout} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onLogoClick={() => setCurrentTab('workspace')} 
          theme={theme}
          onToggleTheme={toggleTheme}
          profilePhoto={profilePhoto}
          onProfilePhotoUpdate={setProfilePhoto}
        />

        <main className="flex-1 p-4 pb-20 md:p-6 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between shrink-0">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight capitalize">{currentTab}</h1>
          </div>
          {currentTab === 'settings' ? (
            <Settings
              onLogout={onLogout}
              profilePhoto={profilePhoto}
              onProfilePhotoUpdate={setProfilePhoto}
            />
          ) : currentTab === 'dashboard' ? (
            <Dashboard tasks={filteredTasks} />
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm animate-pulse">
              Syncing with MongoDB Server...
            </div>
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
              <div className="w-full lg:flex-1 min-w-0 lg:h-full pb-4 shrink-0 lg:shrink">
                <Boardview
                  tasks={filteredTasks}
                  onTaskDropped={handleTaskDropped}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleOpenEditTask}
                  onUpdateTask={handleUpdateTask}
                />
              </div>
              <FocusTasks
                tasks={tasks}
                onEditTask={handleOpenEditTask}
              />
            </div>
          )}
        </main>
      </div>

      {/* NEW / EDIT TASK MODAL */}
      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingTask={editingTask}
        onSave={handleSaveTask}
      />

      {/* CUSTOM BEAUTIFUL DELETE CONFIRMATION DIALOG */}
      {deleteConfirmTaskId && (
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
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Delete Task?</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[280px]">
                  Are you sure you want to delete this task? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmTaskId(null)}
                className="flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-150 cursor-pointer border border-slate-200/60"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = deleteConfirmTaskId;
                  setDeleteConfirmTaskId(null);
                  try {
                    await taskAPI.deleteTask(id);
                    setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
                    toast.success("Task deleted successfully! 🗑️");
                  } catch (err) {
                    toast.error("Failed to delete task.");
                    console.error("Failed to delete task:", err);
                  }
                }}
                className="flex-1 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] rounded-xl transition-all duration-150 shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workspace;