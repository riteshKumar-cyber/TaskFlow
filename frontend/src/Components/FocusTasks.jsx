import React from 'react';
import { FiCalendar } from 'react-icons/fi';

function FocusTasks({ tasks = [], onEditTask }) {
  // Filter high-priority uncompleted tasks and sort by nearest due date first
  const focusTasks = tasks
    .filter(task => {
      const isHighPriority = task.priority?.toLowerCase() === 'high';
      const isNotDone = task.status?.toLowerCase() !== 'done';
      return isHighPriority && isNotDone;
    })
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1; // Nearest due date comes first
      if (b.dueDate) return 1;
      return 0;
    })
    .slice(0, 5);

  const formatDueDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
      case 'inprogress':
        return 'In Progress';
      default:
        return status || 'To Do';
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'in-progress':
      case 'inprogress':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // Synchronized color hashes for custom tags matching Taskcard.jsx
  const getTaskCodeStyles = (code) => {
    if (!code) return "";
    const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variations = [
      'bg-indigo-50 text-indigo-600 border-indigo-100',
      'bg-purple-50 text-purple-600 border-purple-100',
      'bg-pink-50 text-pink-600 border-pink-100',
      'bg-cyan-50 text-cyan-600 border-cyan-100',
      'bg-sky-50 text-sky-600 border-sky-100',
      'bg-violet-50 text-violet-600 border-violet-100',
      'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
      'bg-rose-50 text-rose-600 border-rose-100',
      'bg-amber-50 text-amber-600 border-amber-100',
    ];
    return variations[hash % variations.length];
  };

  return (
    <div className="flex flex-col w-full lg:w-72 h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)] rounded-2xl p-4 bg-slate-50 shrink-0">
      {/* Header aligned with BoardColumn layout */}
      <div className="flex flex-col mb-4 px-1 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Glowing / pulsing dot for priority tasks */}
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold text-slate-700 text-sm">🔥 Focus Tasks</span>
          </div>
          
          {/* Urgent Tasks Count Badge */}
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
            {focusTasks.length}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-none">
          Top 5 urgent active objectives
        </p>
      </div>

      {/* Task List (Scrollable column) */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {focusTasks.map(task => (
          <div
            key={task._id || task.id}
            onClick={() => onEditTask && onEditTask(task)}
            className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col gap-2 hover:scale-[1.01] select-none"
          >
            {/* Top Row: Nickname Code & Status */}
            <div className="flex items-center justify-between gap-2">
              {task.taskCode ? (
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTaskCodeStyles(task.taskCode)}`}>
                  {task.taskCode}
                </span>
              ) : (
                <span className="text-[9px] font-semibold text-slate-400 italic">No code</span>
              )}
              
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getStatusStyles(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h4 className="text-slate-800 font-semibold text-xs leading-tight group-hover:text-blue-600 transition-colors pr-2 break-words">
                {task.title}
              </h4>
              <p className="text-slate-400 text-[10px] line-clamp-1 leading-relaxed mt-1">
                {task.description || "No description provided"}
              </p>
            </div>

            {/* Divider line matching standard Taskcard */}
            <div className="border-t border-slate-100 my-0.5" />

            {/* Bottom Row: Due Date & Priority */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              {task.dueDate ? (
                <div className="flex items-center gap-1 font-semibold">
                  <FiCalendar className="text-slate-400" />
                  <span>{formatDueDate(task.dueDate)}</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-300 font-medium italic">No due date</div>
              )}

              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border bg-rose-50 text-rose-600 border-rose-100 uppercase tracking-wider">
                High
              </span>
            </div>
          </div>
        ))}

        {/* Empty state styled exactly like empty columns */}
        {focusTasks.length === 0 && (
          <div className="h-28 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
            <span className="font-semibold text-slate-500">🎉 Caught Up!</span>
            <span className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              No urgent high-priority objectives.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FocusTasks;
