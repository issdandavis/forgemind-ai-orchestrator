
import React, { useState } from 'react';
import { ResearchTask, TaskStatus, ProjectFeedback } from '../types';

interface Props {
  task: ResearchTask | null;
  onFeedback: (taskId: string, feedback: ProjectFeedback) => void;
}

const DetailPanel: React.FC<Props> = ({ task, onFeedback }) => {
  const [activeTab, setActiveTab] = useState<'research' | 'code' | 'tests' | 'infra' | 'feedback'>('research');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!task) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-4 text-2xl">
          <i className="fas fa-microchip"></i>
        </div>
        <h3 className="text-lg font-bold text-slate-300">Awaiting Target</h3>
        <p className="text-slate-500 text-sm mt-2">Select a project to review research, code, AWS infra, and provide deployment feedback.</p>
      </div>
    );
  }

  const handleFeedbackSubmit = () => {
    onFeedback(task.id, { rating, comments: comment, timestamp: new Date() });
    setComment('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white truncate">{task.topic}</h2>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {['research', 'code', 'tests', 'infra', 'feedback'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'research' && (
          <div className="space-y-4">
             {task.research ? (
               <div className="prose prose-invert prose-sm max-w-none text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                  {task.research.summary}
               </div>
             ) : <p className="text-slate-500 italic">Research in progress...</p>}
          </div>
        )}

        {activeTab === 'code' && (
           <div className="space-y-4">
              {task.code ? (
                Object.entries(task.code).map(([key, val]) => (
                  <div key={key}>
                    <h4 className="text-[10px] uppercase font-bold text-indigo-400 mb-2">{key}</h4>
                    <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] font-mono overflow-x-auto">
                      {val}
                    </pre>
                  </div>
                ))
              ) : <p className="text-slate-500 italic">Generating source code...</p>}
           </div>
        )}

        {activeTab === 'infra' && (
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">AWS Cloud Resources</h4>
            {task.infra ? (
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">S3 Artifact Bucket</p>
                  <code className="text-xs text-indigo-400">{task.infra.s3Bucket}</code>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Lambda Handler</p>
                  <code className="text-xs text-orange-400">{task.infra.lambdaArn}</code>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                   <i className="fas fa-check-circle"></i>
                   SYNCED TO KINDLE LIBRARY
                </div>
              </div>
            ) : <p className="text-slate-500 italic">Provisioning infrastructure...</p>}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Project Evaluation</h4>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-2">Quality Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button 
                      key={n}
                      onClick={() => setRating(n)}
                      className={`w-8 h-8 rounded flex items-center justify-center font-bold ${rating === n ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-2">Technical Feedback</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Suggestions for the next iteration..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 h-24 resize-none"
                />
              </div>
              <button 
                onClick={handleFeedbackSubmit}
                disabled={!comment.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-bold py-3 rounded-lg uppercase tracking-widest transition-all"
              >
                Submit to Notion & Sheets
              </button>

              {task.feedback && (
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <h5 className="text-[9px] text-slate-500 font-bold uppercase mb-2">Recent Submission</h5>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs italic text-slate-400">
                    "{task.feedback.comments}"
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
