
import React from 'react';
import { SlackMessage } from '../services/slackService';
import { ProtonStatus, ZapActivity, ShopifyMetrics } from '../types';

interface Props {
  messages: SlackMessage[];
  onAction: (msgId: string, action: string) => void;
  protonStatus: ProtonStatus;
  zapActivities: ZapActivity[];
  shopifyMetrics: ShopifyMetrics | null;
}

const CommunicationHub: React.FC<Props> = ({ messages, onAction, protonStatus, zapActivities, shopifyMetrics }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <i className="fab fa-slack text-indigo-400"></i>
            Command Hub
          </h3>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all ${
              protonStatus.vpnConnected ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
            }`}>
              <i className={`fas ${protonStatus.vpnConnected ? 'fa-shield-alt' : 'fa-unlock'}`}></i>
              {protonStatus.vpnConnected ? 'Proton Secure' : 'Bypass Mode'}
            </span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold">LIVE</span>
          </div>
        </div>
        
        {protonStatus.vpnConnected && (
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>SRV: {protonStatus.server}</span>
            <span>ENC: {protonStatus.encryptionLevel}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Shopify Metrics Section */}
        {shopifyMetrics && (
          <div className="mb-6">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-2">
              <i className="fab fa-shopify text-emerald-500"></i> Shopify Analytics
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-bold">Sales</span>
                <span className="text-[10px] text-emerald-400 font-mono">{shopifyMetrics.sales}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-bold">Orders</span>
                <span className="text-[10px] text-indigo-400 font-mono">{shopifyMetrics.orders}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-bold">Conv. Rate</span>
                <span className="text-[10px] text-amber-400 font-mono">{shopifyMetrics.conversion}</span>
              </div>
            </div>
          </div>
        )}

        {/* Zap Activity Section */}
        {zapActivities.length > 0 && (
          <div className="mb-6">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-2">
              <i className="fas fa-bolt text-amber-500"></i> Zapier Automations
            </h4>
            <div className="space-y-2">
              {zapActivities.slice(0, 3).map(zap => (
                <div key={zap.id} className="flex items-center justify-between text-[10px] bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-300 truncate max-w-[120px]">{zap.name}</span>
                  <span className="text-emerald-500 font-bold uppercase shrink-0">Executed</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Team Feed</h4>
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-sm py-12">
            <i className="fas fa-satellite-dish mb-2 text-xl opacity-20"></i>
            Awaiting communications...
          </div>
        ) : (
          messages.slice().reverse().map((msg) => (
            <div key={msg.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-slate-500">{msg.channel}</span>
                <span className="text-[9px] text-slate-600">{msg.timestamp.toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {msg.text.split('*').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part)}
              </p>
              
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {msg.actions.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => onAction(msg.id, btn.action)}
                      className={`text-[10px] px-3 py-1.5 rounded font-bold transition-all ${
                        btn.style === 'primary' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' :
                        btn.style === 'danger' ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' :
                        'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunicationHub;
