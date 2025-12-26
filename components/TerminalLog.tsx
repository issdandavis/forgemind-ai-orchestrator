
import React, { useEffect, useRef } from 'react';
import { AgentLog } from '../types';

interface Props {
  logs: AgentLog[];
}

const TerminalLog: React.FC<Props> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      case 'ai': return 'text-indigo-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="bg-black/80 rounded-xl border border-slate-800 flex flex-col h-full shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50 rounded-t-xl">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Console</span>
        <div className="w-12"></div>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 font-mono text-sm overflow-y-auto space-y-1 flex-1 leading-relaxed"
      >
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span className={`${getLogColor(log.level)}`}>
              {log.level === 'ai' && <i className="fas fa-robot mr-2 text-xs opacity-70"></i>}
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-slate-700 italic">Waiting for process initialization...</div>
        )}
      </div>
    </div>
  );
};

export default TerminalLog;
