import React from 'react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'home', label: 'Tạo Truyện', icon: '🎨' },
    { id: 'characters', label: 'Nhân Vật', icon: '👥' },
    { id: 'gallery', label: 'Thư Viện', icon: '🖼️' },
    { id: 'settings', label: 'Lưu Trữ', icon: '☁️' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-secondary border-t border-gray-700 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              currentView === item.id ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;