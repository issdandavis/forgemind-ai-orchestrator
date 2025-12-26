
import React, { useState, useMemo } from 'react';
import { ResearchTask, TaskStatus, TaskPriority } from '../types';

interface Props {
  tasks: ResearchTask[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
}

const TaskGrid: React.FC<Props> = ({ tasks, selectedTaskId, onSelectTask }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return <i className="fas fa-check-circle text-emerald-500"></i>;
      case TaskStatus.FAILED: 
      case TaskStatus.TEST_FAILED: return <i className="fas fa-times-circle text-red-500"></i>;
      case TaskStatus.PENDING: return <i className="fas fa-clock text-slate-500"></i>;
      case TaskStatus.TESTED: return <i className="fas fa-vial text-indigo-400"></i>;
      default: return <i className="fas fa-spinner fa-spin text-indigo-500"></i>;
    }
  };

  const getStatusBg = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20';
      case TaskStatus.FAILED:
      case TaskStatus.TEST_FAILED: return 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20';
      case TaskStatus.PENDING: return 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/80';
      case TaskStatus.TESTED: return 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20';
      default: return 'bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/20';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH: return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case TaskPriority.MEDIUM: return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case TaskPriority.LOW: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
          <input 
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 min-w-[120px]"
        >
          <option value="ALL">All Status</option>
          {Object.values(TaskStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto p-1">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-600 italic">
            No tasks found matching your criteria.
          </div>
        ) : filteredTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`text-left p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
              selectedTaskId === task.id ? 'ring-2 ring-indigo-500 bg-slate-800 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : getStatusBg(task.status)
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold truncate max-w-[85%] text-slate-100">{task.topic}</span>
              <span className="text-xs">{getStatusIcon(task.status)}</span>
            </div>

            <div className="flex gap-2 mb-3">
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mb-1">Status</p>
                <p className={`text-xs font-bold ${task.status === TaskStatus.COMPLETED ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {task.status}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mb-1">Progress</p>
                <p className="text-xs font-mono text-slate-400">{task.progress}%</p>
              </div>
            </div>
            
            {task.status !== TaskStatus.PENDING && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.FAILED && task.status !== TaskStatus.TEST_FAILED && (
              <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500 animate-pulse"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskGrid;
