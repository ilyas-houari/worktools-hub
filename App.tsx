import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import { TOOLS } from './constants';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeTool = TOOLS.find(t => t.id === currentView);

  const renderContent = () => {
    if (activeTool) {
      return (
        <div className="animate-fade-in">
          <div className="mb-6 pb-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">{activeTool.name}</h2>
            <p className="text-slate-500 mt-1">{activeTool.description}</p>
          </div>
          {activeTool.component}
        </div>
      );
    }
    return <WelcomeScreen />;
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 h-16 flex items-center px-4 justify-between shrink-0 z-10">
          <span className="font-bold text-lg text-slate-800">WorkTools Hub</span>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-5xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;