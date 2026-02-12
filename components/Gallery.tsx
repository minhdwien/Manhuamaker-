import React from 'react';
import { ComicPanel } from '../types';

interface Props {
  panels: ComicPanel[];
  onDelete: (id: string) => void;
}

const Gallery: React.FC<Props> = ({ panels, onDelete }) => {
  if (panels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <span className="text-6xl mb-4">🖼️</span>
        <p>Chưa có hình ảnh nào được tạo.</p>
        <p className="text-sm mt-2">Hãy chuyển sang tab "Tạo Truyện" để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 overflow-y-auto h-full no-scrollbar">
      <h2 className="text-2xl font-bold text-white mb-6 sticky top-0 bg-background/95 backdrop-blur py-4 z-10">
        Thư Viện Ảnh
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {panels.slice().reverse().map((panel) => (
          <div key={panel.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
            <img 
              src={panel.imageUrl} 
              alt={panel.prompt} 
              className="w-full h-auto object-contain bg-black"
            />
            <div className="p-4">
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">"{panel.prompt}"</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(panel.timestamp).toLocaleString('vi-VN')}</span>
                <div className="flex gap-3">
                  <a 
                    href={panel.imageUrl} 
                    download={`manhua_${panel.id}.png`}
                    className="text-primary hover:text-white"
                  >
                    Tải về
                  </a>
                  <button 
                    onClick={() => onDelete(panel.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;