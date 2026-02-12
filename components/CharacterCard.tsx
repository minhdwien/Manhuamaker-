import React from 'react';
import { Character } from '../types';

interface Props {
  character: Character;
  onDelete?: (id: string) => void;
  compact?: boolean; // For selection view
  selected?: boolean;
  onSelect?: () => void;
  onOpenInventory?: (id: string) => void; // New prop
}

const CharacterCard: React.FC<Props> = ({ character, onDelete, compact, selected, onSelect, onOpenInventory }) => {
  return (
    <div 
      className={`relative rounded-xl overflow-hidden bg-gray-800 border-2 transition-all cursor-pointer ${
        selected ? 'border-primary shadow-lg shadow-primary/30' : 'border-gray-700'
      } ${compact ? 'w-full' : 'w-full mb-4 group'}`}
      onClick={onSelect}
    >
      <div className={`${compact ? 'aspect-square' : 'aspect-[3/4]'} w-full relative`}>
        <img 
            src={character.imageUrl} 
            alt={character.name} 
            className="absolute inset-0 w-full h-full object-cover bg-black"
        />
        {/* Item count badge */}
        {!compact && character.items && character.items.length > 0 && (
             <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-yellow-400 text-xs font-bold px-2 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1">
                 <span>🎒</span> {character.items.length}
             </div>
        )}
      </div>
      
      {!compact && (
        <div className="p-4 relative">
          <div className="flex justify-between items-start">
            <div className="w-full">
                 <h3 className="text-xl font-bold text-white flex items-center justify-between gap-2 w-full">
                   <div className="flex items-center gap-2">
                        {character.name}
                        {character.stats?.gender && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${character.stats.gender === 'Nam' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                            {character.stats.gender}
                            </span>
                        )}
                   </div>
                 </h3>
                 {character.stats && (
                    <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                        <span className="bg-gray-700 px-2 py-0.5 rounded text-white">{character.stats.age} tuổi</span>
                        <span className="bg-gray-700 px-2 py-0.5 rounded text-white">{character.stats.height}</span>
                        {character.stats.build && <span className="bg-gray-700 px-2 py-0.5 rounded text-white">{character.stats.build}</span>}
                    </div>
                 )}
            </div>
          </div>
          
          {character.stats && (
            <div className="mt-3 bg-gray-900/50 p-2 rounded border border-gray-700/50">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Số đo 3 vòng</p>
                <p className="text-sm font-mono text-primary font-bold">
                    {character.stats.bust} - {character.stats.waist} - {character.stats.hip}
                </p>
            </div>
          )}

          <p className="text-sm text-gray-300 mt-3 line-clamp-2 italic opacity-80">{character.description}</p>
          
          {/* Inventory Action */}
          {onOpenInventory && (
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenInventory(character.id);
                }}
                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-yellow-400 border border-yellow-500/30 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                  <span>🎒</span> Túi Đồ / Pháp Bảo {character.items && character.items.length > 0 ? `(${character.items.length})` : ''}
              </button>
          )}
        </div>
      )}

      {compact && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center backdrop-blur-sm">
           <p className="text-[10px] font-bold text-white truncate px-1">{character.name}</p>
        </div>
      )}

      {onDelete && !compact && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(character.id);
          }}
          className="absolute top-2 right-2 bg-red-600/80 text-white p-2 rounded-full hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default CharacterCard;