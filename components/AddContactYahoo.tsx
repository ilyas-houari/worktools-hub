import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Plus, 
  Download, 
  Terminal, 
  Mail, 
  Users, 
  Settings, 
  Copy, 
  Check, 
  Info, 
  Save,
  FileText,
  CopyPlus
} from 'lucide-react';

interface Session {
  id: string;
  name: string;
}

interface ListData {
  title: string;
  profiles: string;
  contacts: string;
}

const DEFAULT_SESSIONS: Session[] = [
  { id: '840', name: 'CMH15_Yahoo_1' },
  { id: '1025', name: 'CMH15_Yahoo_2' },
  { id: '1496', name: 'CMH15_Yahoo_3' },
  { id: '1497', name: 'CMH15_Yahoo_4' },
  { id: '1553', name: 'CMH15_Yahoo_5' }
];

const AddContactYahoo: React.FC = () => {
  // --- Session Configuration State ---
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('wt_yahoo_sessions');
    return saved ? JSON.parse(saved) : DEFAULT_SESSIONS;
  });

  useEffect(() => {
    localStorage.setItem('wt_yahoo_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // --- List Management State ---
  const [listCount, setListCount] = useState<number>(1);
  const [lists, setLists] = useState<ListData[]>([{ title: '1', profiles: '', contacts: '' }]);
  const [commandOutput, setCommandOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [copiedSessions, setCopiedSessions] = useState<Record<string, boolean>>({});

  // Update lists array when count changes
  const handleListCountChange = (count: number) => {
    const newCount = Math.max(1, count);
    setListCount(newCount);
    setLists(prev => {
      const next = [...prev];
      if (newCount > prev.length) {
        for (let i = prev.length; i < newCount; i++) {
          next.push({ title: (i + 1).toString(), profiles: '', contacts: '' });
        }
      } else {
        return next.slice(0, newCount);
      }
      return next;
    });
  };

  const updateList = (index: number, field: keyof ListData, value: string) => {
    setLists(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addSession = () => {
    setSessions([...sessions, { id: '', name: '' }]);
  };

  const updateSession = (index: number, field: keyof Session, value: string) => {
    const next = [...sessions];
    next[index] = { ...next[index], [field]: value };
    setSessions(next);
  };

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  // --- Generation Logic ---
  const handleGenerate = () => {
    let allCommands: string[] = [];
    const sessionMap = new Map(sessions.map(s => [s.name.trim(), s.id.trim()]));

    lists.forEach((list) => {
      if (!list.title.trim()) return;

      const profileLines = list.profiles.split(/\r?\n/).filter(l => l.trim());
      const sessionGroups: Record<string, string[]> = {};

      profileLines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const sName = parts[0];
          const pId = parts[1];
          if (!sessionGroups[sName]) sessionGroups[sName] = [];
          sessionGroups[sName].push(pId);
        }
      });

      Object.entries(sessionGroups).forEach(([sName, profiles]) => {
        const sId = sessionMap.get(sName);
        if (sId) {
          allCommands.push(`${sId}|${profiles.join(',')}|D:\\WebAutoMat\\add_contact\\add_contact${list.title.trim()}.csv`);
        }
      });
    });

    setCommandOutput(allCommands.join('\n'));
    setIsCopied(false);
    setCopiedSessions({}); // Reset session copy states on new generation
  };

  const handleExportAll = () => {
    lists.forEach(list => {
      if (!list.title.trim() || !list.contacts.trim()) return;
      
      const csvContent = "Email\n" + list.contacts.split(/\r?\n/).filter(e => e.trim()).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `add_contact${list.title.trim()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleCopyCommands = async () => {
    if (!commandOutput) return;
    try {
      await navigator.clipboard.writeText(commandOutput);
      setIsCopied(true);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Session-Specific Copy Logic ---
  const handleCopySessionProfiles = async (sessionName: string) => {
    const uniqueProfiles: string[] = [];
    const seen = new Set<string>();

    lists.forEach(list => {
      const profileLines = list.profiles.split(/\r?\n/).filter(l => l.trim());
      profileLines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const sName = parts[0].trim();
          const pId = parts[1].trim();
          if (sName === sessionName && !seen.has(pId)) {
            seen.add(pId);
            uniqueProfiles.push(pId);
          }
        }
      });
    });

    if (uniqueProfiles.length === 0) return;

    try {
      await navigator.clipboard.writeText(uniqueProfiles.join('\n'));
      setCopiedSessions(prev => ({ ...prev, [sessionName]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const canGenerate = lists.every(l => l.title.trim() !== '' && l.profiles.trim() !== '') && listCount > 0;

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8 animate-fade-in pb-20">
      
      {/* 1. SESSIONS CONFIGURATION */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-800 tracking-tight">Sessions Configuration</h3>
          </div>
          <button 
            onClick={addSession}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Session
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <input 
                  type="text"
                  placeholder="ID (e.g. 840)"
                  className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none"
                  value={session.id}
                  onChange={(e) => updateSession(idx, 'id', e.target.value)}
                />
                <input 
                  type="text"
                  placeholder="Session Name"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={session.name}
                  onChange={(e) => updateSession(idx, 'name', e.target.value)}
                />
                <button 
                  onClick={() => removeSession(idx)}
                  className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. LIST COUNT CONTROL */}
      <section className="flex flex-col sm:flex-row items-center gap-4 bg-primary-50 p-6 rounded-2xl border border-primary-100">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-primary-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            List Generation
          </h4>
          <p className="text-sm text-primary-700/80 mt-1">Define the number of independent lists and files to generate.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-primary-800">Number of lists:</label>
          <input 
            type="number"
            min="1"
            className="w-20 px-4 py-2 bg-white border border-primary-200 rounded-xl font-bold text-center focus:ring-2 focus:ring-primary-500 outline-none"
            value={listCount}
            onChange={(e) => handleListCountChange(parseInt(e.target.value) || 1)}
          />
        </div>
      </section>

      {/* 3. LIST BLOCKS */}
      <div className="grid grid-cols-1 gap-8">
        {lists.map((list, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                  {idx + 1}
                </span>
                <h4 className="font-bold text-sm tracking-widest uppercase">List Block</h4>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold uppercase opacity-60">Title:</label>
                <input 
                  type="text"
                  placeholder="1"
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm font-bold focus:bg-white/20 outline-none w-24"
                  value={list.title}
                  onChange={(e) => updateList(idx, 'title', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* Profiles Input */}
              <div className="p-6 space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Profiles Data
                </label>
                <textarea 
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono resize-none focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed"
                  placeholder={`CMH15_Yahoo_3  117\nCMH15_Yahoo_4  1538`}
                  value={list.profiles}
                  onChange={(e) => updateList(idx, 'profiles', e.target.value)}
                />
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  Format: SessionName[Space]ProfileID
                </div>
              </div>

              {/* Contacts Input */}
              <div className="p-6 space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Contacts (Emails)
                </label>
                <textarea 
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono resize-none focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed"
                  placeholder="email1@domain.com&#10;email2@domain.com"
                  value={list.contacts}
                  onChange={(e) => updateList(idx, 'contacts', e.target.value)}
                />
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  One email per line
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-slate-200">
        <button 
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="flex items-center gap-2 px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
        >
          <Terminal className="w-5 h-5 group-hover:animate-pulse" />
          Generate All Commands
        </button>
        <button 
          onClick={handleExportAll}
          disabled={!canGenerate}
          className="flex items-center gap-2 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
        >
          <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          Export All CSV Files
        </button>
      </div>

      {/* 5. OUTPUTS */}
      {commandOutput && (
        <section className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary-400" />
              <h3 className="font-bold text-slate-200 tracking-tight">Generated Command Terminal</h3>
            </div>
            <button 
              onClick={handleCopyCommands}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isCopied 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy Commands'}
            </button>
          </div>
          <div className="p-6">
            <textarea 
              readOnly
              className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-6 text-primary-400 font-mono text-xs resize-none outline-none leading-relaxed"
              value={commandOutput}
            />
            <div className="mt-4 flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                D:\WebAutoMat directory used
              </span>
              <span>•</span>
              <span>{commandOutput.split('\n').length} Commands Generated</span>
            </div>
          </div>
        </section>
      )}

      {/* 6. COPY PROFILES BY SESSION */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <CopyPlus className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-800 tracking-tight">Copy Profiles by Session</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.filter(s => s.name.trim() !== '').map((session) => (
              <button
                key={session.name}
                onClick={() => handleCopySessionProfiles(session.name)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all active:scale-95 ${
                  copiedSessions[session.name]
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <span className="truncate pr-2">Copy all profiles {session.name}</span>
                {copiedSessions[session.name] ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>
          {sessions.every(s => s.name.trim() === '') && (
            <p className="text-center text-slate-400 text-sm py-4 italic">
              Configure session names above to enable quick-copy.
            </p>
          )}
        </div>
      </section>

      {/* Footer Info */}
      <div className="flex items-start gap-3 p-4 bg-slate-100 rounded-xl text-slate-500 text-xs leading-relaxed">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          CSV files will be named <strong>add_contact[TITLE].csv</strong>. 
          The command text maps configured session names to their respective IDs. 
          Make sure your profile data follows the correct space-separated format. 
          <strong>Copy Profiles by Session</strong> will collect all unique IDs for a specific session across all list blocks.
        </p>
      </div>
    </div>
  );
};

export default AddContactYahoo;