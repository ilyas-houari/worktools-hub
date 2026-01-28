import React from 'react';
import { Tool } from '../types';
import { TOOLS } from '../constants';
import { Box, ChevronRight, Settings, LifeBuoy } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onCloseMobile}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onNavigate('welcome'); onCloseMobile(); }}>
            <div className="bg-primary-600 p-1.5 rounded-lg text-white">
              <Box className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">WorkTools Hub</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
          <div className="mb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tools
          </div>

          <div className="space-y-1 mb-8">
            {TOOLS.length > 0 ? (
              TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onNavigate(tool.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === tool.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tool.icon className={`w-5 h-5 ${currentView === tool.id ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span>{tool.name}</span>
                  </div>
                  {currentView === tool.id && <ChevronRight className="w-4 h-4 text-primary-500" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 border-2 border-dashed border-slate-100 rounded-lg text-center">
                <p className="text-sm text-slate-400">No tools installed</p>
              </div>
            )}
          </div>

          <div className="mb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Coming Soon
          </div>
          <div className="space-y-1 opacity-60 pointer-events-none select-none">
            <div className="px-3 py-2 text-sm text-slate-500 flex items-center gap-3">
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
              <span>Unit Converter</span>
            </div>
            <div className="px-3 py-2 text-sm text-slate-500 flex items-center gap-3">
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
              <span>JSON Formatter</span>
            </div>
            <div className="px-3 py-2 text-sm text-slate-500 flex items-center gap-3">
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
              <span>Regex Tester</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-1">
           <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <LifeBuoy className="w-5 h-5 text-slate-400" />
            <span>Help & Support</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;