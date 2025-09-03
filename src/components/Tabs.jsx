import React from 'react';

export function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex bg-white/10 backdrop-blur-lg rounded-lg p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:block">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}