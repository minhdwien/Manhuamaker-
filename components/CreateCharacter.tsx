import React, { useState, useRef, useEffect } from 'react';
import { Character, CharacterStats, CharacterAppearance } from '../types';
import { generateCharacterImage } from '../services/geminiService';

interface Props {
  onSave: (char: Character) => void;
  onBack: () => void;
}

const hairColors = ['Đen huyền', 'Bạch kim', 'Đỏ rượu', 'Tím khói', 'Xanh băng', 'Vàng kim'];
const eyeColors = ['Đen láy', 'Hổ phách', 'Xanh ngọc', 'Đỏ huyết', 'Tím mộng mơ', 'Vàng kim'];
const skinTones = ['Trắng sứ (Ngọc cốt)', 'Trắng hồng', 'Bánh mật khỏe khoắn', 'Trắng xanh (Băng giá)'];

// Separate builds for genders - Update to Cultivation style terms
const femaleBuilds = ['Mình hạc xương mai', 'Đồng hồ cát quyến rũ', 'Đầy đặn (Phì nhiêu)', 'Mảnh mai thoát tục', 'Yêu mị (Gợi cảm)'];
const maleBuilds = ['Thư sinh nho nhã', 'Vạm vỡ (Mãnh tướng)', 'Cường tráng', 'Tiên phong đạo cốt', 'Tà mị cuồng quyến'];

const CreateCharacter: React.FC<Props> = ({ onSave, onBack }) => {
  const [mode, setMode] = useState<'upload' | 'generate'>('generate');
  const [name, setName] = useState('');
  
  // Stats State
  const [stats, setStats] = useState<CharacterStats>({ 
    gender: 'Nữ',
    height: '165cm', 
    bust: '90', 
    waist: '60', 
    hip: '90',
    age: '18', // Cultivation chars often look young
    skinTone: 'Trắng sứ (Ngọc cốt)',
    build: 'Yêu mị (Gợi cảm)'
  });

  // Appearance State
  const [appearance, setAppearance] = useState<CharacterAppearance>({
    hairStyle: 'Tóc dài buông xõa cài trâm',
    hairColor: 'Đen huyền',
    eyeColor: 'Đen láy',
    clothingStyle: 'Yếm lụa mỏng khoác áo voan',
    accessories: 'Ngọc bội'
  });

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update defaults when gender changes
  useEffect(() => {
    if (stats.gender === 'Nam') {
      setStats(prev => ({
        ...prev,
        height: '185cm',
        bust: '105', 
        waist: '85',
        hip: '95',
        build: 'Tà mị cuồng quyến'
      }));
      setAppearance(prev => ({
        ...prev,
        hairStyle: 'Tóc dài buộc cao',
        clothingStyle: 'Hắc y thêu rồng (Black Robes)',
        accessories: 'Kiếm cổ'
      }));
    } else {
      setStats(prev => ({
        ...prev,
        height: '165cm',
        bust: '92',
        waist: '58',
        hip: '92',
        build: 'Yêu mị (Gợi cảm)'
      }));
      setAppearance(prev => ({
        ...prev,
        hairStyle: 'Tóc dài thướt tha cài trâm ngọc',
        clothingStyle: 'Váy lụa mỏng cổ trang (Hanfu)',
        accessories: 'Khăn lụa'
      }));
    }
  }, [stats.gender]);

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
    setLoading(true);
    try {
      const img = await generateCharacterImage(name || "Đạo Hữu", description, stats, appearance);
      setPreviewImage(img);
    } catch (e) {
      alert("Lỗi tạo ảnh: " + e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!name || !previewImage) return alert("Cần tên và hình ảnh!");
    
    const newChar: Character = {
      id: Date.now().toString(),
      name,
      description: mode === 'generate' ? description : 'Hình ảnh tải lên từ thiết bị',
      imageUrl: previewImage,
      stats: mode === 'generate' ? stats : undefined,
      appearance: mode === 'generate' ? appearance : undefined
    };
    onSave(newChar);
    onBack();
  };

  const renderSelect = (label: string, value: string, options: string[], onChange: (val: string) => void) => (
    <div className="mb-4">
      <label className="block text-xs text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              value === opt 
                ? 'bg-primary border-primary text-white shadow-md' 
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            {opt}
          </button>
        ))}
        <input 
            type="text" 
            placeholder="Khác..." 
            className="px-3 py-1.5 rounded-full text-xs bg-gray-800 border border-gray-700 text-white w-20 focus:border-primary outline-none"
            onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 pb-40 h-full bg-background text-white overflow-y-auto no-scrollbar relative">
      <div className="flex items-center mb-6 sticky top-0 bg-background/95 backdrop-blur z-20 py-2">
        <button onClick={onBack} className="mr-4 text-2xl p-2 -ml-2">←</button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Tạo Nhân Vật Cổ Trang
        </h1>
      </div>

      {/* Name Input */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-1">Đạo Hiệu / Tên Nhân Vật</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:border-primary outline-none font-serif"
          placeholder={stats.gender === 'Nam' ? "Ví dụ: Lăng Thiên Đế" : "Ví dụ: Cửu Vĩ Hồ Ly"}
        />
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
        <button 
          onClick={() => setMode('generate')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'generate' ? 'bg-primary text-white shadow' : 'text-gray-400'}`}
        >
          AI Tạo Hình (Tiên Hiệp)
        </button>
        <button 
          onClick={() => setMode('upload')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'upload' ? 'bg-primary text-white shadow' : 'text-gray-400'}`}
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
              <span className="text-4xl block mb-2">📷</span>
              Nhấn để tải ảnh từ thư viện
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
      ) : (
        <div className="space-y-6">
           
           {/* Section 0: Gender */}
           <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <label className="text-xs text-gray-400 block mb-2 uppercase font-bold">Giới Tính</label>
              <div className="flex gap-4">
                  <button 
                    onClick={() => setStats({...stats, gender: 'Nam'})}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${stats.gender === 'Nam' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-gray-700 text-gray-400'}`}
                  >
                    ♂️ Nam Tu
                  </button>
                  <button 
                    onClick={() => setStats({...stats, gender: 'Nữ'})}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${stats.gender === 'Nữ' ? 'border-pink-500 bg-pink-500/20 text-pink-400' : 'border-gray-700 text-gray-400'}`}
                  >
                    ♀️ Nữ Tu
                  </button>
              </div>
           </div>

           {/* Section 1: Body Metrics */}
           <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                <span>📏</span> Hình Thể (Tiên Cốt)
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <label className="text-xs text-gray-400 block mb-1">Tuổi (Ngoại hình)</label>
                  <input type="number" value={stats.age} onChange={e => setStats({...stats, age: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
               </div>
               <div>
                  <label className="text-xs text-gray-400 block mb-1">Chiều cao</label>
                  <input type="text" value={stats.height} onChange={e => setStats({...stats, height: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
               </div>
            </div>

            <div className="mb-4">
                 <label className="text-xs text-gray-400 block mb-2">Số Đo 3 Vòng (cm) - Tạo dáng gợi cảm</label>
                 <div className="flex gap-2 items-center">
                    <div className="flex-1">
                        <input type="number" placeholder="Ngực" value={stats.bust} onChange={e => setStats({...stats, bust: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-center font-bold text-pink-400" />
                        <span className="text-[10px] text-gray-500 text-center block">{stats.gender === 'Nam' ? 'Ngực' : 'Vòng 1'}</span>
                    </div>
                    <span className="text-gray-600">-</span>
                    <div className="flex-1">
                        <input type="number" placeholder="Eo" value={stats.waist} onChange={e => setStats({...stats, waist: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-center" />
                        <span className="text-[10px] text-gray-500 text-center block">{stats.gender === 'Nam' ? 'Bụng' : 'Vòng 2'}</span>
                    </div>
                    <span className="text-gray-600">-</span>
                    <div className="flex-1">
                        <input type="number" placeholder="Mông" value={stats.hip} onChange={e => setStats({...stats, hip: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-center font-bold text-pink-400" />
                        <span className="text-[10px] text-gray-500 text-center block">{stats.gender === 'Nam' ? 'Hông' : 'Vòng 3'}</span>
                    </div>
                 </div>
            </div>

            {renderSelect("Dáng người (Khí chất)", stats.build, stats.gender === 'Nam' ? maleBuilds : femaleBuilds, (v) => setStats({...stats, build: v}))}
            {renderSelect("Màu da (Ngọc cốt)", stats.skinTone, skinTones, (v) => setStats({...stats, skinTone: v}))}
           </div>

           {/* Section 2: Face & Hair */}
           <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-accent font-bold mb-4 flex items-center gap-2">
                <span>💇</span> Dung Mạo
            </h3>
            
            {renderSelect("Màu tóc", appearance.hairColor, hairColors, (v) => setAppearance({...appearance, hairColor: v}))}
            
            <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-1">Kiểu tóc (Cổ trang)</label>
                <input type="text" value={appearance.hairStyle} onChange={e => setAppearance({...appearance, hairStyle: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" placeholder={stats.gender === 'Nam' ? "Ví dụ: Tóc buộc cao..." : "Ví dụ: Tóc xõa dài cài trâm..."} />
            </div>

            {renderSelect("Màu mắt", appearance.eyeColor, eyeColors, (v) => setAppearance({...appearance, eyeColor: v}))}
           </div>

           {/* Section 3: Style */}
           <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                <span>👘</span> Y Phục & Pháp Bảo
            </h3>
            
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Y Phục (Ưu tiên lụa là, cổ trang)</label>
                    <input type="text" value={appearance.clothingStyle} onChange={e => setAppearance({...appearance, clothingStyle: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" placeholder={stats.gender === 'Nam' ? "Ví dụ: Hắc bào, Giáp trụ..." : "Ví dụ: Yếm đỏ, Váy lụa mỏng..."} />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Phụ kiện / Pháp bảo</label>
                    <input type="text" value={appearance.accessories} onChange={e => setAppearance({...appearance, accessories: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" placeholder="Ví dụ: Kiếm, Hồ lô, Quạt giấy..." />
                </div>
            </div>
           </div>

           {/* Additional Description */}
           <div>
            <label className="block text-sm text-gray-400 mb-1">Mô tả thần thái (Mị hoặc, Lạnh lùng...)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 h-20 text-sm focus:border-primary outline-none font-serif"
              placeholder="Thần thái cao ngạo, ánh mắt như hồ nước mùa thu, nốt ruồi son dưới mắt..."
            />
           </div>

           <button 
             onClick={handleGenerate}
             disabled={loading}
             className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 hover:shadow-pink-500/50 transition-all border border-white/10"
           >
             {loading ? 'Đang Luyện Hóa...' : 'Tạo Chân Dung'}
           </button>

           {previewImage && (
             <div className="mt-4 animate-in fade-in duration-500">
               <p className="text-sm text-gray-400 mb-2 font-bold">Kết quả:</p>
               <img src={previewImage} alt="AI Result" className="w-full rounded-xl border-2 border-primary shadow-lg" />
             </div>
           )}
        </div>
      )}

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 w-full bg-background border-t border-gray-800 p-4 z-30 pb-safe">
          <button 
            onClick={handleSave}
            disabled={!name || !previewImage}
            className="w-full bg-green-700 hover:bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            Lưu Vào Động Phủ
          </button>
      </div>
    </div>
  );
};

export default CreateCharacter;