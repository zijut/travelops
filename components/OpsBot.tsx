
import React, { useState } from 'react';
import { Icon } from './shared/Icon';

interface OpsBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onCommand?: (command: string) => string;
}

const OpsBot: React.FC<OpsBotProps> = ({ isOpen, setIsOpen, onCommand }) => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Assalamualaikum! Saya OpsBot. Ada yang bisa saya bantu terkait operasional umroh?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    
    // Process command
    if (onCommand) {
        // Simulating a slight delay for "thinking"
        setTimeout(() => {
            const responseText = onCommand(input);
            setMessages(prev => [...prev, { from: 'bot', text: responseText }]);
        }, 500);
    } else {
        setTimeout(() => {
            setMessages(prev => [...prev, { from: 'bot', text: `Bot offline (No command handler).`}]);
        }, 500);
    }
    
    setInput('');
  };

  return (
    <>
      {/* Floating launcher trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-5 md:bottom-5 md:right-5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-3.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 focus:outline-none transition-all duration-200 z-50 group hover:shadow-emerald-500/30 cursor-pointer"
        title="Tanya Asisten AI"
      >
        <div className="relative">
          {/* Active Status indicator */}
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-amber-400 rounded-full border-2 border-emerald-600 animate-pulse" />
          <Icon name="bot" className="h-5.5 w-5.5 text-white" style={{ width: '22px', height: '22px' }} />
        </div>
      </button>

      {/* Modern floating chat card */}
      {isOpen && (
        <div className="fixed bottom-[142px] right-5 md:bottom-20 md:right-5 w-[340px] max-w-[calc(100vw-40px)] h-[450px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-250 z-50 animate-scale-up">
          {/* Beautiful gradient header */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white px-4 py-3 border-b border-emerald-950/20 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white/10 rounded-xl relative">
                <Icon name="bot" className="h-5 w-5 text-emerald-300" style={{ width: '20px', height: '20px' }} />
                <span className="absolute bottom-0.5 right-0.5 h-2 w-2 bg-emerald-400 rounded-full ring-2 ring-emerald-800" />
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-xs tracking-wider text-white">OPSBOT ASSISTANT</h3>
                <p className="text-[9px] text-emerald-300 font-medium tracking-wide">Asisten AI Operasional • Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          {/* Messages scroll content */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950/60 space-y-3.5 scrollbar-thin">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed transition-all text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                  msg.from === 'bot' 
                    ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-none' 
                    : 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-500/10'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive footer input */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/85 shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik 'Add task...' atau tanya apa saja"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              />
              <button 
                onClick={handleSend} 
                className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Icon name="send" className="h-4 w-4" style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OpsBot;
