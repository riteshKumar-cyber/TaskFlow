import React from 'react';
import { FiCalendar, FiClock, FiTrash2, FiEdit2 } from 'react-icons/fi';

function Taskcard({ task, onDelete, onEdit, onUpdateTask }) {
  
  // Safe variable for ID: Handle both local testing (id) and MongoDB (_id)
  const taskId = task._id || task.id;
  const dateInputRef = React.useRef(null);

  const handleDateChange = (newDateVal) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, { dueDate: newDateVal || null });
    }
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (err) {
        dateInputRef.current.click();
      }
    }
  };

  const getSafeDateTimeString = (dateVal) => {
    if (!dateVal) return "";
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  // Determine priority color styles
  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'medium':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'low':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // Generate dynamic premium pastel colors for task code badge
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

  const formatDueDate = (dateStr) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "No due date";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Drag-and-drop start handler
  const handleDragStart = (e) => {
    // MongoDB safe ID transfer
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };



  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group relative select-none"
    >
      {/* Action buttons (shows on hover on desktop, always visible on touch/mobile) */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit && onEdit(task)}
          className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-50 rounded-lg transition-colors"
          title="Edit Task"
        >
          <FiEdit2 className="text-xs" />
        </button>
        <button
          onClick={() => onDelete && onDelete(taskId)} // Safety trigger using correct ID
          className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-50 rounded-lg transition-colors"
          title="Delete Task"
        >
          <FiTrash2 className="text-xs" />
        </button>
      </div>

      {/* Title */}
      <h4 className="text-slate-800 font-semibold text-sm leading-tight pr-6 mb-1.5">
        {task.title}
      </h4>

      {/* Description */}
      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
        {task.description || "No description provided"}
      </p>

      {/* Tags and Metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Priority Badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityStyles(task.priority)}`}>
          {task.priority || 'low'}
        </span>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          {/* Due date with inline picker */}
          <div 
            onClick={handleContainerClick}
            className="relative flex items-center gap-1 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-xl transition-colors group/date"
          >
            <FiCalendar className="text-slate-400 group-hover/date:text-blue-500 transition-colors" />
            <span className="group-hover/date:text-blue-600 transition-colors">{formatDueDate(task.dueDate)}</span>
            <input 
              ref={dateInputRef}
              type="date" 
              className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              value={getSafeDateTimeString(task.dueDate)}
              onChange={(e) => handleDateChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Time estimate */}
          {task.estimate && (
            <div className="flex items-center gap-1">
              <FiClock className="text-slate-400" />
              <span>{task.estimate}</span>
            </div>
          )}
        </div>

        {/* Task Code Badge in Bottom-Right Corner */}
        {task.taskCode && (
          <span className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-md border shadow-xs uppercase tracking-wider ${getTaskCodeStyles(task.taskCode)}`}>
            <span className="text-[10px]"></span>
            <span>{task.taskCode}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default Taskcard;