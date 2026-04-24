import React, { useState } from 'react';
import { FileText, Link2, MessageSquare, Shield } from 'lucide-react';
import type { SidebarTab } from '../../hooks/useSessionRoom';

interface Message { id: string; author: string; text: string; time: string; }
interface Resource { id: string; title: string; url: string; }

interface SessionSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (t: SidebarTab) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  escrowStatus: 'idle' | 'releasing' | 'released';
  collateral: number;
  borrowedAmount: number;
}

const TABS: { key: SidebarTab; icon: React.ReactNode; label: string }[] = [
  { key: 'notes',     icon: <FileText className="h-4 w-4" />,      label: 'Notes' },
  { key: 'resources', icon: <Link2 className="h-4 w-4" />,         label: 'Resources' },
  { key: 'chat',      icon: <MessageSquare className="h-4 w-4" />, label: 'Chat' },
  { key: 'escrow',    icon: <Shield className="h-4 w-4" />,        label: 'Escrow' },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', author: 'Alex Chen', text: 'Welcome! Let\'s get started.', time: '10:01' },
  { id: '2', author: 'You', text: 'Thanks, ready when you are!', time: '10:02' },
];

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  activeTab, onTabChange, notes, onNotesChange, escrowStatus, collateral, borrowedAmount,
}) => {
  const [resources, setResources] = useState<Resource[]>([
    { id: 'r1', title: 'React Docs', url: 'https://react.dev' },
  ]);
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const addResource = () => {
    if (!resTitle || !resUrl) return;
    setResources(r => [...r, { id: Date.now().toString(), title: resTitle, url: resUrl }]);
    setResTitle(''); setResUrl('');
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(m => [...m, { id: Date.now().toString(), author: 'You', text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      {/* Tab bar */}
      <div className="flex border-b border-white/10">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
              activeTab === t.key ? 'border-b-2 border-blue-400 text-blue-400' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'notes' && (
          <textarea
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Take notes during the session…"
            className="h-full min-h-[300px] w-full resize-none rounded-xl bg-white/5 p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        )}

        {activeTab === 'resources' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <input value={resTitle} onChange={e => setResTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <input value={resUrl} onChange={e => setResUrl(e.target.value)} placeholder="https://…" className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <button onClick={addResource} className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Add Resource</button>
            </div>
            <ul className="space-y-2">
              {resources.map(r => (
                <li key={r.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-blue-400 hover:underline">{r.title}</a>
                  <button onClick={() => setResources(rs => rs.filter(x => x.id !== r.id))} className="ml-2 text-white/30 hover:text-red-400 text-xs">✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex h-full flex-col gap-3">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.author === 'You' ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-white/40 mb-0.5">{m.author} · {m.time}</span>
                  <span className={`rounded-xl px-3 py-2 text-sm max-w-[85%] ${m.author === 'You' ? 'bg-blue-600' : 'bg-white/10'}`}>{m.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Message…"
                className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button onClick={sendMessage} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Send</button>
            </div>
          </div>
        )}

        {activeTab === 'escrow' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Escrow Status</h3>
            <div className="rounded-xl bg-white/5 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/60">Locked</span><span>{collateral} USDC</span></div>
              <div className="flex justify-between"><span className="text-white/60">Platform fee</span><span>{(collateral * 0.2).toFixed(2)} USDC</span></div>
              <div className="flex justify-between font-semibold"><span className="text-white/60">Mentor receives</span><span>{(collateral * 0.8).toFixed(2)} USDC</span></div>
            </div>
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              escrowStatus === 'released' ? 'bg-green-500/20 text-green-400' :
              escrowStatus === 'releasing' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-white/5 text-white/60'
            }`}>
              {escrowStatus === 'released' ? '✓ Funds released to mentor' :
               escrowStatus === 'releasing' ? '⏳ Releasing funds…' :
               '🔒 Funds held in escrow — released on session end'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSidebar;
