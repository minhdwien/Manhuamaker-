import React, { useState, useEffect } from 'react';
import { Character, ComicPanel } from '../types';
import CharacterCard from './CharacterCard';
import { generateComicPanel } from '../services/geminiService';

interface Props {
  characters: Character[];
  onGenerateSuccess: (panel: ComicPanel) => void;
  onRequestCharacter: () => void; // Redirect to create character page
}

const ComicGenerator: React.FC<Props> = ({ characters, onGenerateSuccess, onRequestCharacter }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-detect characters mentioned in prompt to help the user, 
  // but allow them to manually toggle off/on in the grid.
  useEffect(() => {
    if (!prompt) return;

    const foundIds = characters
      .filter(char => prompt.toLowerCase().includes(char.name.toLowerCase()))
      .map(char => char.id);
    
    if (foundIds.length > 0) {
      setSelectedIds(prev => {
        // Merge detected IDs with existing selection
        const next = new Set([...prev, ...foundIds]);
        // Only update state if the size changes to prevent loops/unnecessary renders
        if (next.size !== prev.length) return Array.from(next);
        return prev;
      });
    }
    
  }, [prompt, characters]);

  const toggleCharacter = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id) // Deselect
        : [...prev, id] // Select
    );
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    // Use the explicitly selected characters for the generation context
    const selectedChars = characters.filter(c => selectedIds.includes(c.id));

    try {
      const imgBase64 = await generateComicPanel(prompt, selectedChars);
      const newPanel: ComicPanel = {
        id: Date.now().toString(),
        prompt,
        imageUrl: imgBase64,
        timestamp: Date.now()
      };
      onGenerateSuccess(newPanel);
      setPrompt(''); // Clear prompt
      // We keep the selection for convenience in next generation
    } catch (e) {
      alert("Lỗi tạo truyện: " + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      <div className="p-4 bg-secondary shadow-md sticky top-0 z-10 border-b border-gray-700">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
            Vẽ Cảnh Truyện
        </h2>
        <p className="text-xs text-gray-400">
          Mô tả cảnh tu tiên. Chọn các nhân vật bên dưới để đưa vào tranh.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Input Area */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ví dụ: Tiểu Lan đang ngồi thiền dưới gốc cây đào, áo lụa bay trong gió..."
          className="w-full bg-gray-800 text-white rounded-xl p-4 border border-gray-700 h-32 focus:border-pink-500 outline-none resize-none font-serif leading-relaxed text-sm shadow-inner"
        />

        {/* Character Selection Grid */}
        <div className="space-y-2">
            <div className="flex justify-between items-end border-b border-gray-800 pb-2">
                <div>
                    <h3 className="text-sm font-bold text-gray-300">Chọn Nhân Vật</h3>
                    <p className="text-[10px] text-gray-500">Đã chọn: <span className="text-primary font-bold">{selectedIds.length}</span></p>
                </div>
                <button 
                    onClick={onRequestCharacter}
                    className="text-xs bg-gray-800 border border-gray-700 hover:border-pink-500 hover:text-pink-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                    + Tạo mới
                </button>
            </div>
            
            {characters.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-gray-700 rounded-xl bg-gray-800/50">
                    <span className="text-4xl block mb-2 opacity-30">👥</span>
                    <p className="text-sm text-gray-400">Chưa có nhân vật nào.</p>
                    <p className="text-xs text-gray-500 mt-1">Tạo nhân vật trước để thêm vào truyện.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {characters.map(char => (
                        <div key={char.id} className="relative group">
                            <CharacterCard 
                                character={char} 
                                compact 
                                selected={selectedIds.includes(char.id)}
                                onSelect={() => toggleCharacter(char.id)}
                            />
                            {/* Selection Checkmark Overlay */}
                            {selectedIds.includes(char.id) && (
                                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md border border-white z-10 pointer-events-none animate-in zoom-in duration-200">
                                    ✓
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-background border-t border-gray-800">
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 border border-white/10"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Đang Họa Tranh...
            </span>
          ) : 'Khởi Tạo Cảnh'}
        </button>
      </div>
    </div>
  );
};

export default ComicGenerator;