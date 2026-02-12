import React, { useState, useRef } from 'react';
import { Item } from '../types';
import { generateItemImage } from '../services/geminiService';

interface Props {
  onSave: (item: Item) => void;
  onBack: () => void;
}

const itemTypes = ['Thần Binh (Vũ Khí)', 'Pháp Bảo (Hỗ Trợ)', 'Đan Dược', 'Bí Tịch', 'Linh Thú', 'Trang Phục'];

const CreateItem: React.FC<Props> = ({ onSave, onBack }) => {
  const [mode, setMode] = useState<'upload' | 'generate'>('generate');
  const [name, setName] = useState('');
  const [type, setType] = useState('Thần Binh (Vũ Khí)');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!name || !description) return alert("Vui lòng nhập tên và mô tả.");
    setLoading(true);
    try {
      const img = await generateItemImage(name, type, description);
      setPreviewImage(img);
    } catch (e) {
      alert("Lỗi tạo vật phẩm: " + e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!name || !previewImage) return alert("Cần tên và hình ảnh!");
    
    const newItem: Item = {
      id: Date.now().toString(),
      name,
      type,
      description: mode === 'generate' ? description : 'Vật phẩm tải lên',
      imageUrl: previewImage,
    };
    onSave(newItem);
  };

  return (
    <div className="p-4 pb-40 h-full bg-background text-white overflow-y-auto no-scrollbar relative">
      <div className="flex items-center mb-6 sticky top-0 bg-background/95 backdrop-blur z-20 py-2">
        <button onClick={onBack} className="mr-4 text-2xl p-2 -ml-2">←</button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Rèn Đúc Pháp Bảo
        </h1>
      </div>

      <div className="space-y-6">
          
        {/* Name */}
        <div>
           <label className="block text-sm text-gray-400 mb-1">Tên Vật Phẩm</label>
           <input 
             type="text" 
             value={name}
             onChange={(e) => setName(e.target.value)}
             className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:border-yellow-500 outline-none font-serif text-yellow-100"
             placeholder="Ví dụ: Hiên Viên Kiếm, Trúc Cơ Đan..."
           />
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1">
            <button 
            onClick={() => setMode('generate')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'generate' ? 'bg-yellow-600 text-white shadow' : 'text-gray-400'}`}
            >
            AI Rèn Đúc
            </button>
            <button 
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'upload' ? 'bg-yellow-600 text-white shadow' : 'text-gray-400'}`}
            >
            Tải Ảnh Lên
            </button>
        </div>

        {mode === 'upload' ? (
             <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center" onClick={() => fileInputRef.current?.click()}>
                {previewImage ? (
                    <img src={previewImage} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
                ) : (
                    <div className="text-gray-400">
                    <span className="text-4xl block mb-2">💎</span>
                    Nhấn để tải ảnh vật phẩm
                    </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
             </div>
        ) : (
             <div className="space-y-4">
                 <div>
                    <label className="block text-sm text-gray-400 mb-2">Loại Vật Phẩm</label>
                    <div className="flex flex-wrap gap-2">
                        {itemTypes.map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${type === t ? 'bg-yellow-600/30 border-yellow-500 text-yellow-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Mô tả chi tiết</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 h-24 text-sm focus:border-yellow-500 outline-none font-serif"
                        placeholder="Thanh kiếm tỏa ra hàn khí, cán kiếm chạm khắc rồng vàng, lưỡi kiếm trong suốt như băng..."
                    />
                 </div>

                 <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 hover:shadow-orange-500/50 transition-all border border-white/10"
                >
                    {loading ? 'Đang Rèn Đúc...' : 'Khởi Tạo Vật Phẩm'}
                </button>
             </div>
        )}

        {previewImage && mode === 'generate' && (
             <div className="animate-in fade-in duration-500 bg-gray-800 p-4 rounded-xl border border-yellow-500/30">
               <p className="text-sm text-yellow-400 mb-2 font-bold text-center">Thành Phẩm</p>
               <img src={previewImage} alt="Item Result" className="w-40 h-40 mx-auto rounded-lg object-contain bg-black/40 border border-gray-700" />
             </div>
        )}
      </div>

       <div className="fixed bottom-0 left-0 w-full bg-background border-t border-gray-800 p-4 z-30 pb-safe">
          <button 
            onClick={handleSave}
            disabled={!name || !previewImage}
            className="w-full bg-green-700 hover:bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            Thu Nhập Vào Túi
          </button>
      </div>
    </div>
  );
};

export default CreateItem;