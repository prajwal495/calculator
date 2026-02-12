import React from 'react';
import { HistoryItem } from '../types';

interface HistoryLogProps {
  history: HistoryItem[];
  onClear: () => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history, onClear }) => {
  return (
    <div className="bg-[#120505] border-l-2 border-[#2a0a0a] w-full lg:w-80 h-full p-4 flex flex-col text-red-100/80 overflow-hidden">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-red-900/30">
        <h3 className="font-dragon text-xl text-amber-600">Ancient Scrolls</h3>
        <button onClick={onClear} className="text-xs hover:text-red-400 transition-colors uppercase tracking-wider">Burn All</button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {history.length === 0 ? (
          <div className="text-center text-red-900/40 italic mt-10">
            No chronicles yet recorded...
          </div>
        ) : (
          history.slice().reverse().map((item, idx) => (
            <div key={idx} className={`p-3 rounded bg-[#1c0808] border ${item.type === 'dragon' ? 'border-amber-900/50' : 'border-red-900/20'}`}>
              <div className="text-xs text-red-400 mb-1 flex justify-between">
                <span>{item.type === 'dragon' ? '🐉 Dragon Wisdom' : '🧮 Calculation'}</span>
                <span className="opacity-50">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="text-sm font-mono opacity-70 mb-1 break-words">{item.expression}</div>
              <div className={`text-lg font-bold font-dragon ${item.type === 'dragon' ? 'text-amber-500' : 'text-red-100'}`}>{item.result}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
