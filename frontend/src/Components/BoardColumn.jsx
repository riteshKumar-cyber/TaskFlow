import React, { useState } from 'react';
import Taskcard from './Taskcard';

function BoardColumn({ column, tasks, onTaskDropped, onDeleteTask, onEditTask, onUpdateTask }) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Styling maps based on column id (added 'in-progress' safety check)
  const columnStyles = {
    todo: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
      title: 'To Do',
    },
    'in-progress': { // Added to match standard backend slugs
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      lightBg: 'bg-amber-50',
      title: 'In Progress',
    },
    inprogress: { // Keep for safety
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      lightBg: 'bg-amber-50',
      title: 'In Progress',
    },
    done: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
      title: 'Done',
    },
  };

  // Safe mapping logic
  const currentStyle = columnStyles[column.id] || {
    bg: 'bg-slate-500',
    text: 'text-slate-600',
    lightBg: 'bg-slate-50',
    title: column.title,
  };

  // Drag over handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onTaskDropped) {
      onTaskDropped(taskId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-[85vw] sm:w-72 h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)] rounded-2xl p-4 transition-all duration-200 snap-center shrink-0 ${
        isDragOver ? 'bg-slate-100/80 scale-[1.01] ring-2 ring-blue-500/20' : 'bg-slate-50'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1 py-1 rounded-xl">
        <div className="flex items-center gap-2">
          {/* Status Colored Dot */}
          <div className={`w-2.5 h-2.5 rounded-full ${currentStyle.bg}`} />
          <span className="font-bold text-slate-700 text-sm">{column.title}</span>
        </div>
        
        {/* Task Counter Badge */}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${currentStyle.lightBg} ${currentStyle.text}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task List (Scrollable column) */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {tasks.map((task) => (
          // Backend ready: Handle both task._id (MongoDB) and task.id
          <Taskcard 
            key={task._id || task.id} 
            task={task} 
            onDelete={onDeleteTask} 
            onEdit={onEditTask}
            onUpdateTask={onUpdateTask}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-28 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
            <span>No tasks in this column</span>
            <span className="text-[10px] text-slate-400 mt-1">Drag and drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardColumn;