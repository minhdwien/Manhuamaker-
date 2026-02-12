import React from 'react';
import { Character, Item } from '../types';

interface Props {
  character: Character;
  onBack: () => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
}

const CharacterDetail: React.FC<Props> = ({ character, onBack, onAddItem, onDeleteItem }) => {
  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
        {/* Header Image */}
        <div className="relative h-64 w-full shrink-0">
             <img src={character.imageUrl} className="w-full h-full object-cover opacity-60" alt="bg"/>
             <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
             <button onClick={onBack} className="absolute top-4 left-4 bg-black/50 p-2 rounded-full text-white backdrop-blur z-10">
                 ← Quay lại
             </button>
             <div className="absolute bottom-4 left-4 right-4">
                 <h1 className="text-3xl font-bold text-white mb-1 shadow-black drop-shadow-md">{character.name}</h1>
                 <p className="text-gray-300 text-sm line-clamp-1 italic">{character.description}</p>
             </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {/* Stats Summary */}
            <div className="flex gap-2 mb-6 text-xs text-gray-400 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <div className="flex-1 text-center border-r border-gray-700">
                    <span className="block font-bold text-white text-lg">{character.stats?.age || 'Unknown'}</span>
                    Tuổi
                </div>
                <div className="flex-1 text-center border-r border-gray-700">
                    <span className="block font-bold text-white text-lg">{character.stats?.height || '?'}</span>
                    Chiều cao
                </div>
                <div className="flex-1 text-center">
                    <span className="block font-bold text-primary text-lg">{character.items?.length || 0}</span>
                    Pháp Bảo
                </div>
            </div>

            {/* Inventory Section */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
                    <span>🎒</span> Túi Đồ / Pháp Bảo
                </h2>
                <button 
                    onClick={onAddItem}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-lg"
                >
                    + Rèn Đúc / Thêm
                </button>
            </div>

            {(!character.items || character.items.length === 0) ? (
                <div className="text-center py-10 border border-dashed border-gray-700 rounded-xl bg-gray-800/30">
                    <span className="text-4xl block mb-2 opacity-30">📦</span>
                    <p className="text-sm text-gray-500">Túi đồ trống rỗng.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {character.items.map(item => (
                        <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden group relative">
                            <div className="aspect-square w-full bg-black/40 p-2 relative">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                                <div className="absolute top-1 right-1 bg-black/60 text-[10px] px-1.5 py-0.5 rounded text-white backdrop-blur">
                                    {item.type}
                                </div>
                            </div>
                            <div className="p-2">
                                <h3 className="font-bold text-sm text-yellow-100 truncate">{item.name}</h3>
                                <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 h-8">{item.description}</p>
                            </div>
                            <button 
                                onClick={() => onDeleteItem(item.id)}
                                className="absolute top-2 left-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-gray-800">
                <h3 className="text-sm font-bold text-gray-400 mb-2">Thông Tin Chi Tiết</h3>
                <div className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                    <p><span className="text-gray-500">Dáng người:</span> {character.stats?.build}</p>
                    <p><span className="text-gray-500">Trang phục:</span> {character.appearance?.clothingStyle}</p>
                    <p><span className="text-gray-500">Phụ kiện:</span> {character.appearance?.accessories}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CharacterDetail;