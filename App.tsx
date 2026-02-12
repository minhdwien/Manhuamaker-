import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ComicGenerator from './components/ComicGenerator';
import CreateCharacter from './components/CreateCharacter';
import CreateItem from './components/CreateItem';
import CharacterDetail from './components/CharacterDetail';
import Gallery from './components/Gallery';
import CharacterCard from './components/CharacterCard';
import CloudStorage from './components/CloudStorage';
import { Character, ComicPanel, ViewState, BackupData, Item } from './types';

// Mock data for initial state
const initialCharacters: Character[] = [];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('manhua_characters');
    return saved ? JSON.parse(saved) : initialCharacters;
  });
  const [panels, setPanels] = useState<ComicPanel[]>(() => {
    const saved = localStorage.getItem('manhua_panels');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('manhua_characters', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('manhua_panels', JSON.stringify(panels));
  }, [panels]);

  const handleSaveCharacter = (char: Character) => {
    setCharacters([...characters, char]);
  };

  const handleDeleteCharacter = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa nhân vật này?")) {
      setCharacters(characters.filter(c => c.id !== id));
    }
  };

  // --- Item Management ---
  const handleOpenInventory = (charId: string) => {
    setSelectedCharId(charId);
    setCurrentView('character-detail');
  };

  const handleAddItem = (newItem: Item) => {
    if (!selectedCharId) return;
    setCharacters(prev => prev.map(c => {
        if (c.id === selectedCharId) {
            const items = c.items || [];
            return { ...c, items: [...items, newItem] };
        }
        return c;
    }));
    setCurrentView('character-detail');
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedCharId) return;
    if (!window.confirm("Hủy bỏ vật phẩm này?")) return;
    
    setCharacters(prev => prev.map(c => {
        if (c.id === selectedCharId && c.items) {
            return { ...c, items: c.items.filter(i => i.id !== itemId) };
        }
        return c;
    }));
  };
  // ----------------------

  const handleGenerateSuccess = (panel: ComicPanel) => {
    setPanels([...panels, panel]);
    setCurrentView('gallery'); // Switch to gallery to see result
  };

  const handleDeletePanel = (id: string) => {
    setPanels(panels.filter(p => p.id !== id));
  };

  const handleCloudRestore = (data: BackupData) => {
    if (window.confirm("Cảnh báo: Hành động này sẽ ghi đè dữ liệu hiện tại bằng dữ liệu từ Cloud. Bạn có chắc chắn không?")) {
      setCharacters(data.characters || []);
      setPanels(data.panels || []);
      alert("Đã khôi phục dữ liệu thành công!");
    }
  };

  // Render content based on state (Single Page App routing)
  const renderContent = () => {
    switch (currentView) {
      case 'create-character':
        return (
          <CreateCharacter 
            onSave={handleSaveCharacter} 
            onBack={() => setCurrentView('characters')} 
          />
        );

      case 'character-detail':
        const selectedChar = characters.find(c => c.id === selectedCharId);
        if (!selectedChar) return <div>Lỗi: Không tìm thấy nhân vật</div>;
        return (
            <CharacterDetail 
                character={selectedChar}
                onBack={() => setCurrentView('characters')}
                onAddItem={() => setCurrentView('create-item')}
                onDeleteItem={handleDeleteItem}
            />
        );

      case 'create-item':
        return (
            <CreateItem 
                onSave={handleAddItem}
                onBack={() => setCurrentView('character-detail')}
            />
        );

      case 'characters':
        return (
          <div className="p-4 pb-24 h-full overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-background/95 py-4 z-10 backdrop-blur">
              <h2 className="text-2xl font-bold text-white">Nhân Vật</h2>
              <button 
                onClick={() => setCurrentView('create-character')}
                className="bg-primary hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
              >
                + Thêm Mới
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {characters.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500">
                  <p>Chưa có nhân vật nào.</p>
                  <p className="text-sm">Thêm nhân vật để bắt đầu tạo truyện đồng nhất.</p>
                </div>
              ) : (
                characters.map(char => (
                  <CharacterCard 
                    key={char.id} 
                    character={char} 
                    onDelete={handleDeleteCharacter} 
                    onOpenInventory={handleOpenInventory}
                  />
                ))
              )}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <Gallery panels={panels} onDelete={handleDeletePanel} />
        );

      case 'settings':
        return (
          <CloudStorage 
            characters={characters}
            panels={panels}
            onRestore={handleCloudRestore}
          />
        );

      case 'home':
      default:
        return (
          <ComicGenerator 
            characters={characters}
            onGenerateSuccess={handleGenerateSuccess}
            onRequestCharacter={() => setCurrentView('create-character')}
          />
        );
    }
  };

  return (
    <div className="bg-background h-screen w-screen overflow-hidden flex flex-col text-white font-sans">
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      {/* Hide navigation when in detailed full-screen modes */}
      {currentView !== 'create-character' && currentView !== 'character-detail' && currentView !== 'create-item' && (
        <Navigation currentView={currentView} setView={setCurrentView} />
      )}
    </div>
  );
};

export default App;