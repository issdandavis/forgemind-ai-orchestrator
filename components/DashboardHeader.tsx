
import React from 'react';

interface Props {
  totalTasks: number;
  completedTasks: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

const DashboardHeader: React.FC<Props> = ({ totalTasks, completedTasks, isRunning, onStart, onStop }) => {
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-6 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="bg-indigo-600 p-2 rounded-lg"><i className="fas fa-microchip"></i></span>
            ForgeMind AI Agent
          </h1>
          <p className="text-slate-400 text-sm mt-1">Autonomous Research & Code Generation Pipeline</p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
          <div className="flex gap-4">
            {!isRunning ? (
              <button 
                onClick={onStart}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition-all"
              >
                <i className="fas fa-play text-xs"></i> Initialize Sequence
              </button>
            ) : (
              <button 
                onClick={onStop}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition-all"
              >
                <i className="fas fa-stop text-xs"></i> Halt Operations
              </button>
            )}
          </div>
          
          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Overall Progress</span>
              <span>{completedTasks} / {totalTasks} ({Math.round(progressPercent)}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
