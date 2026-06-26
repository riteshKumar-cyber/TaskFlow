import React from 'react';

function Dashboard({ tasks = [] }) {
  // ----------------------------------------------------
  // 1. DATA PREPARATION (Simple Counts & Percentages)
  // ----------------------------------------------------
  const totalTasks = tasks.length;
  
  // Filter tasks by status
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress' || t.status === 'inprogress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const todoCount = todoTasks.length;
  const inProgressCount = inProgressTasks.length;
  const doneCount = doneTasks.length;

  // Calculate percentages
  const activeTotal = totalTasks || 1; // Prevent division by zero
  const todoPercent = Math.round((todoCount / activeTotal) * 100);
  const donePercent = Math.round((doneCount / activeTotal) * 100);
  const inProgressPercent = 100 - todoPercent - donePercent;

  // ----------------------------------------------------
  // 2. PARSE TASK ESTIMATE HOURS (Safe number parsing)
  // ----------------------------------------------------
  const getHours = (estimate) => {
    if (!estimate) return 0;
    // Convert estimate to string in case it is saved as a number
    const match = String(estimate).match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const todoHours = todoTasks.reduce((sum, t) => sum + getHours(t.estimate), 0);
  const inProgressHours = inProgressTasks.reduce((sum, t) => sum + getHours(t.estimate), 0);

  // ----------------------------------------------------
  // 3. WEEKDAY DISTRIBUTION DATA
  // ----------------------------------------------------
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Initialize counts for Mon-Sun
  const barData = weekdays.map(day => ({ day, todo: 0, inProgress: 0, done: 0 }));
  // Initialize effort hours for Mon-Fri
  const effortHours = [0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri

  tasks.forEach(task => {
    // Determine weekday of task
    let dayIndex = 0; // Default Monday
    if (task.createdAt) {
      const date = new Date(task.createdAt);
      const rawDay = date.getDay(); // 0 is Sunday, 1 is Monday, ...
      dayIndex = rawDay === 0 ? 6 : rawDay - 1; // Map Sunday to 6, Mon to 0
    } else {
      // Deterministic fallback based on task ID
      const id = task._id || task.id || '0';
      const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      dayIndex = charSum % 7;
    }

    const status = task.status?.toLowerCase();
    
    // Add to daily bar counts
    if (barData[dayIndex]) {
      if (status === 'todo') barData[dayIndex].todo++;
      else if (status === 'in-progress' || status === 'inprogress') barData[dayIndex].inProgress++;
      else if (status === 'done') barData[dayIndex].done++;
    }

    // Add to Mon-Fri effort hours
    if (dayIndex < 5) {
      effortHours[dayIndex] += getHours(task.estimate);
    }
  });

  // Calculate average completion rate
  const avgCompletion = doneCount > 0 ? Math.round((doneCount / 7) * 10) / 10 : 0;

  // ----------------------------------------------------
  // 4. CHART SCALING HELPERS
  // ----------------------------------------------------
  // Scale for Bar Chart
  const maxBarSum = Math.max(...barData.map(d => d.todo + d.inProgress + d.done), 1);
  const barMax = Math.max(Math.ceil(maxBarSum / 4) * 4, 4); // Always multiple of 4

  // Scale for Line Chart
  const maxHours = Math.max(...effortHours, 1);
  const lineMax = Math.max(Math.ceil(maxHours / 5) * 5, 25);

  // ----------------------------------------------------
  // 5. DONUT SVG CALCULATIONS
  // ----------------------------------------------------
  // Circumference of circle of radius 40 is ~251.2
  const circ = 251.2;
  const doneStroke = (doneCount / activeTotal) * circ;
  const ipStroke = (inProgressCount / activeTotal) * circ;
  const todoStroke = (todoCount / activeTotal) * circ;

  // ----------------------------------------------------
  // 6. LINE CHART GENERATION
  // ----------------------------------------------------
  // X coordinates for Mon, Tue, Wed, Thu, Fri
  const lineX = [40, 95, 150, 205, 260];
  
  // Get Y coordinates for actual hours
  const actualY = effortHours.map(hours => 130 - (hours / lineMax) * 100);
  
  // Calculate simple prediction values
  const predictedY = effortHours.map((hours, i) => {
    const predictedHours = hours * 0.8 + (i * 2 + 3);
    return 130 - (predictedHours / lineMax) * 100;
  });

  // SVG Paths
  const actualPath = `M ${lineX.map((x, i) => `${x},${actualY[i]}`).join(' L ')}`;
  const predictedPath = `M ${lineX.map((x, i) => `${x},${predictedY[i]}`).join(' L ')}`;
  const areaPath = `${actualPath} L 260,130 L 40,130 Z`;

  // Calculate total completed effort hours
  const doneHours = doneTasks.reduce((sum, t) => sum + getHours(t.estimate), 0);

  return (
    <div className="flex-1 w-full bg-slate-50 flex flex-col gap-6 overflow-y-auto animate-in fade-in duration-200 pr-1">
      
      {/* Title */}
      <div>
        <p className="text-xs text-slate-400 font-medium mt-1">Real-time metrics and effort predictions</p>
      </div>

      {/* Grid wrapper for three charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full pb-6">
        
        {/* CARD 1: TEAM PRODUCTIVITY (Stacked Bar) */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col gap-5 justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Task Distribution by Day</h3>
              <p className="text-[10px] text-slate-400 font-medium">Weekly Task Volume</p>
            </div>
          </div>

          <div className="flex justify-end">
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Daily Completion Rate: <span className="text-blue-600 font-extrabold">{avgCompletion} Tasks</span>
            </span>
          </div>

          {/* Bar Chart SVG */}
          <div className="w-full">
            <svg viewBox="0 0 320 180" className="w-full h-44 dashboard-chart">
              {/* Y-Axis Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 140 - ratio * 120;
                return (
                  <g key={idx}>
                    <line x1="40" y1={y} x2="300" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="32" y={y + 3} className="text-[9px] font-bold text-slate-400" textAnchor="end">
                      {Math.round(ratio * barMax)}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Line */}
              <line x1="40" y1="140" x2="300" y2="140" stroke="#e2e8f0" strokeWidth="1" />

              {/* Stacked Bars */}
              {barData.map((d, i) => {
                const x = 55 + i * 35;
                const w = 14; // Width of bar

                // Heights of each stack segment
                const todoH = (d.todo / barMax) * 120;
                const inProgressH = (d.inProgress / barMax) * 120;
                const doneH = (d.done / barMax) * 120;

                // Y positions
                const doneY = 140 - doneH;
                const inProgressY = doneY - inProgressH;
                const todoY = inProgressY - todoH;

                return (
                  <g key={d.day}>
                    {/* Done (Green) */}
                    {d.done > 0 && <rect x={x} y={doneY} width={w} height={doneH} fill="#10b981" rx={d.todo + d.inProgress === 0 ? 3 : 0} />}
                    {/* In Progress (Cyan) */}
                    {d.inProgress > 0 && <rect x={x} y={inProgressY} width={w} height={inProgressH} fill="#06b6d4" rx={d.todo === 0 ? 3 : 0} />}
                    {/* Todo (Blue) */}
                    {d.todo > 0 && <rect x={x} y={todoY} width={w} height={todoH} fill="#3b82f6" rx={3} />}

                    {/* Day label */}
                    <text x={x + w / 2} y="154" className="text-[9px] font-bold text-slate-400" textAnchor="middle">
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Totals Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Todo</span>
              <span className="text-base font-extrabold text-blue-600 mt-1">{todoCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
              <span className="text-base font-extrabold text-cyan-600 mt-1">{inProgressCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Done</span>
              <span className="text-base font-extrabold text-emerald-600 mt-1">{doneCount}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: WORKFLOW STATE DISTRIBUTION (Donut Chart) */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Workflow State Distribution</h3>
            <p className="text-[10px] text-slate-400 font-medium">Active Status Breakdown</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
            {/* SVG Donut */}
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {totalTasks === 0 ? (
                  // Empty state ring
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                ) : (
                  <>
                    {/* Done Arc (Green) */}
                    {doneStroke > 0 && (
                      <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="none" 
                        strokeDasharray={`${doneStroke} 252`} strokeDashoffset={0} strokeLinecap="round" />
                    )}
                    {/* In Progress Arc (Cyan) */}
                    {ipStroke > 0 && (
                      <circle cx="50" cy="50" r="40" stroke="#06b6d4" strokeWidth="12" fill="none" 
                        strokeDasharray={`${ipStroke} 252`} strokeDashoffset={-doneStroke} strokeLinecap="round" />
                    )}
                    {/* Todo Arc (Blue) */}
                    {todoStroke > 0 && (
                      <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="12" fill="none" 
                        strokeDasharray={`${todoStroke} 252`} strokeDashoffset={-(doneStroke + ipStroke)} strokeLinecap="round" />
                    )}
                  </>
                )}
              </svg>

              {/* Center Labels */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
                <span className="text-xl font-extrabold text-slate-800">{totalTasks}</span>
              </div>
            </div>

            {/* Labels and Percentages */}
            <div className="flex flex-col gap-3 text-xs w-full sm:w-auto">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-slate-700">Done</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium pl-4">{doneCount} Tasks, {donePercent}%</span>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-bold text-slate-700">Todo</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium pl-4">{todoCount} Tasks, {todoPercent}%</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                  <span className="font-bold text-slate-700">In Progress</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium pl-4">{inProgressCount} Tasks, {inProgressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-4 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-500" /> Todo</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-cyan-500" /> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500" /> Done</span>
          </div>
        </div>

        {/* CARD 3: PREDICTIVE & ACTUAL EFFORT (Line Chart) */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Weekly Effort Forecast</h3>
              <p className="text-[10px] text-slate-400 font-medium">Actual vs. Predicted Effort Hours</p>
            </div>
          </div>

          <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase pl-8">
            Hours
          </div>

          {/* Line Chart SVG */}
          <div className="w-full">
            <svg viewBox="0 0 300 150" className="w-full h-40 dashboard-chart">
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, idx) => {
                const y = 130 - ratio * 100;
                return (
                  <g key={idx}>
                    <line x1="40" y1={y} x2="280" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="32" y={y + 3} className="text-[9px] font-bold text-slate-400" textAnchor="end">
                      {Math.round(ratio * lineMax)}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis */}
              <line x1="40" y1="130" x2="280" y2="130" stroke="#e2e8f0" strokeWidth="1" />

              {/* Gradient Shading under actual line */}
              {totalTasks > 0 && <path d={areaPath} fill="url(#chart-area-grad)" />}

              {/* Predicted Effort Line (Dotted Cyan) */}
              {totalTasks > 0 && (
                <path d={predictedPath} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
              )}

              {/* Actual Effort Line (Solid Blue) */}
              {totalTasks > 0 && (
                <path d={actualPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Actual Node Dots */}
              {totalTasks > 0 && actualY.map((y, idx) => (
                <circle key={idx} cx={lineX[idx]} cy={y} r="3" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
              ))}

              {/* Weekdays Labels */}
              {weekdays.slice(0, 5).map((day, i) => (
                <text key={day} x={lineX[i]} y="144" className="text-[9px] font-bold text-slate-400" textAnchor="middle">
                  {day}
                </text>
              ))}
            </svg>
          </div>

          {/* Effort Summaries Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="todo-potential-badge bg-slate-900 text-white rounded-2xl p-2.5 flex flex-col justify-center items-center shadow-sm">
              <span className="text-[7.5px] font-bold uppercase tracking-wider text-slate-400 text-center leading-none">Backlog Effort</span>
              <span className="text-xs font-black mt-1.5 whitespace-nowrap">{todoHours} hrs</span>
            </div>

            <div className="bg-cyan-500 text-white rounded-2xl p-2.5 flex flex-col justify-center items-center shadow-sm">
              <span className="text-[7.5px] font-bold uppercase tracking-wider text-cyan-100 text-center leading-none">Active Effort</span>
              <span className="text-xs font-black mt-1.5 whitespace-nowrap">{inProgressHours} hrs</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-sm">
              <span className="text-[7.5px] font-bold uppercase tracking-wider text-emerald-500 text-center leading-none">Completed Effort</span>
              <span className="text-xs font-black mt-1.5 whitespace-nowrap">{doneHours} hrs</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
