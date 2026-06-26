import React from 'react';
import BoardColumn from './BoardColumn';

function Boardview({ tasks = [], onTaskDropped, onDeleteTask, onEditTask, onUpdateTask }) {
  // Columns array jise humne BoardColumn ke styling objects se align kar diya hai
  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' }, // Standard format matching backend/styles
    { id: 'done', title: 'Done' },
  ];

  return (
    <div className="flex gap-5 overflow-x-auto pb-4 pr-4 snap-x snap-mandatory scroll-smooth">
      {columns.map((column) => {
        // Filter tasks that belong to this column (Safe lowecase check)
        const columnTasks = tasks.filter((task) => {
          const taskStatus = task.status?.toLowerCase();
          
          // Agar database me 'inprogress' bina hyphen ke ho, toh bhi handle karega
          if (column.id === 'in-progress') {
            return taskStatus === 'in-progress' || taskStatus === 'inprogress';
          }
          return taskStatus === column.id;
        });
        
        return (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={columnTasks}
            onTaskDropped={onTaskDropped}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onUpdateTask={onUpdateTask}
          />
        );
      })}
    </div>
  );
}

export default Boardview;