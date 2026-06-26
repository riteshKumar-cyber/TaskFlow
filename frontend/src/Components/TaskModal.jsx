import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiEdit2 } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function TaskModal({ isOpen, onClose, editingTask, onSave }) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newTaskCode, setNewTaskCode] = useState('');
  const [newEstimate, setNewEstimate] = useState('8 hrs');
  const [newDueDate, setNewDueDate] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const getSafeDateTimeString = (dateVal) => {
    if (!dateVal) return "";
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setNewTitle(editingTask.title || '');
        setNewDesc(editingTask.description || '');
        setNewPriority(editingTask.priority || 'Medium');
        setNewTaskCode(editingTask.taskCode || '');
        setNewEstimate(editingTask.estimate || '');
        setNewDueDate(getSafeDateTimeString(editingTask.dueDate));
      } else {
        setNewTitle('');
        setNewDesc('');
        setNewPriority('Medium');
        setNewTaskCode('');
        setNewEstimate('8 hrs');
        setNewDueDate('');
      }
    }
  }, [isOpen, editingTask]);

  if (!isOpen) return null;

  const handleAISuggestion = async () => {
    if (!newDesc.trim()) {
      toast.error("Description cannot be empty!");
      return;
    }
    setAiLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      };
      const response = await axios.post(`${BASE_URL}/ai/suggest`, {
        description: newDesc,
        currentDate: new Date().toISOString()
      }, { headers });

      const data = response.data;
      if (data) {
        if (data.title) setNewTitle(data.title);
        if (data.priority) setNewPriority(data.priority);
        if (data.estimate) setNewEstimate(data.estimate);
        if (data.dueDate) setNewDueDate(getSafeDateTimeString(data.dueDate));
        toast.success("AI suggestions generated successfully");
      }
    } catch (err) {
      toast.error("Failed to generate AI suggestions");
      console.error("AI service failure:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const taskData = {
      title: newTitle,
      description: newDesc || 'No description provided.',
      priority: newPriority,
      estimate: newEstimate || '',
      taskCode: newTaskCode || '',
      dueDate: newDueDate || null,
    };
    onSave(taskData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* AI Custom Beautiful Loader Overlay */}
        {aiLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
            </div>
            <p className="text-xs font-bold text-slate-700 tracking-wide animate-pulse">AI is predicting fields...</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Autofilling the task form details</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <FiX className="text-xl" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingTask ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
            {editingTask ? <FiEdit2 className="text-lg" /> : <FiPlus className="text-lg" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Keep track of your workspace objectives</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* AI Copilot Info Banner */}
          <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5 text-left animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-[11px] text-slate-700 font-bold leading-relaxed">
              Just enter a Description and click AI Suggest to autofill all other fields!
            </span>
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <button
                type="button"
                onClick={handleAISuggestion}
                disabled={aiLoading}
                className="text-[10px] font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-all duration-200 disabled:opacity-50 border border-blue-100/60 cursor-pointer"
              >
                {aiLoading ? "Generating..." : "AI Suggest"}
              </button>
            </div>
            <textarea
              rows="2"
              placeholder="Describe your task details. AI will autofill the rest!"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200/80 text-slate-700 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/80 transition-all duration-200 resize-none placeholder:text-slate-350 font-medium"
            />
          </div>

          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Develop User API"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200/80 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/80 transition-all duration-200 placeholder:text-slate-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/80 transition-all duration-200 font-medium cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimate</label>
              <input
                type="text"
                placeholder="e.g. 8 hrs"
                value={newEstimate}
                onChange={(e) => setNewEstimate(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/80 transition-all duration-200 placeholder:text-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Code / Nickname</label>
              <input
                type="text"
                maxLength={6}
                placeholder="Max 6 chars (e.g. TASK12)"
                value={newTaskCode}
                onChange={(e) => setNewTaskCode(e.target.value.slice(0, 6))}
                className="w-full bg-slate-50/50 border border-slate-200/80 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/80 transition-all duration-200 placeholder:text-slate-300 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/80 transition-all duration-200 font-medium cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all duration-150 shadow-md shadow-slate-950/10"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
