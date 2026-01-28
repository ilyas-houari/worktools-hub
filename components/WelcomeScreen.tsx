import React from 'react';
import { Layers, PlusCircle, LayoutGrid } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-center px-4 animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-slate-100">
        <LayoutGrid className="w-12 h-12 text-primary-600" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
        Welcome to WorkTools Hub
      </h1>
      
      <p className="text-slate-500 text-lg max-w-xl mb-10 leading-relaxed">
        A professional suite of modern utilities designed to streamline your workflow.
        Select a tool from the sidebar to get started.
      </p>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No tools added yet</h3>
          <p className="text-slate-500 mb-6">
            The framework is ready. Ask me anytime to add a new tool to this collection.
          </p>
          <button 
            disabled
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed select-none"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Tool (Coming Soon)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;