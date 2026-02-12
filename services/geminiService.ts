import { GoogleGenAI } from "@google/genai";
import { Character, CharacterStats, CharacterAppearance } from "../types";

// Helper to get the best available API Key
const getApiKey = (): string => {
  // 1. Check for user-provided key in LocalStorage
  const customKey = localStorage.getItem('gemini_api_key');
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  // 2. Fallback to Environment Variable
  return process.env.API_KEY || '';
};

// Initialize client securely on every request to ensure latest key is used
const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key chưa được cấu hình. Vui lòng vào mục 'Lưu Trữ' để nhập Key.");
  return new GoogleGenAI({ apiKey: apiKey });
};

export const generateCharacterImage = async (
  name: string,
  description: string,
  stats: CharacterStats,
  appearance: CharacterAppearance
): Promise<string> => {
  const ai = getClient();
  
  // Gender specific nuances for "Sac Hiep" style
  const isMale = stats.gender === 'Nam';
  
  // Prompt tuning for "Sắc Hiệp" (Sensual Cultivation Manhua)
  const styleKeywords = isMale
    ? "Nam chính tiên hiệp, tuấn mỹ, tà mị, khí chất bá đạo, cơ bắp săn chắc nhưng thanh thoát (handsome cultivation protagonist, muscular but elegant)."
    : "Nữ chính sắc hiệp, vóc dáng đồng hồ cát cực chuẩn, quyến rũ, mị hoặc, da trắng như ngọc, trang phục cổ trang tôn dáng (alluring cultivation fairy, curvaceous, jade skin, form-fitting ancient robes).";

  const bustLabel = isMale ? "Vòng ngực vạm vỡ (Chest)" : "Vòng 1 căng tròn quyến rũ (Voluptuous Bust)";
  const clothingNuance = "Trang phục cổ trang lụa là, phiêu dật, có độ rủ mềm mại, chi tiết thêu kim tuyến tinh xảo.";

  // Construct a prompt that emphasizes specific proportions and ancient aesthetic
  const prompt = `
    Vẽ thiết kế nhân vật truyện tranh phong cách Manhua Tiên Hiệp/Sắc Hiệp (Ancient Cultivation Manhua), toàn thân (full body character sheet).
    
    PHONG CÁCH NGHỆ THUẬT:
    - Nét vẽ: Manhua hiện đại chất lượng cao (Masterpiece), màu sắc rực rỡ, hiệu ứng ánh sáng huyền ảo (glow), da nhân vật có độ bóng nhẹ (soft shine skin).
    - Thần thái: ${styleKeywords}
    - Bối cảnh: Không gian cổ đại giả tưởng, sương khói mờ ảo.

    THÔNG TIN NHÂN VẬT:
    - Tên: ${name}
    - Giới tính: ${stats.gender}
    - Tuổi: ${stats.age} (Ngoại hình trẻ trung, bất lão)
    - Dáng người: ${stats.build}
    - Màu da: ${stats.skinTone}
    - Kiểu tóc: ${appearance.hairStyle} (Phong cách cổ trang)
    - Màu tóc: ${appearance.hairColor}
    - Màu mắt: ${appearance.eyeColor}
    - Trang phục: ${appearance.clothingStyle}. ${clothingNuance}
    - Phụ kiện: ${appearance.accessories}
    
    MÔ TẢ BỔ SUNG:
    ${description}
    
    YÊU CẦU KỸ THUẬT VỀ HÌNH THỂ (Tuân thủ tuyệt đối số đo):
    - Chiều cao: ${stats.height}
    - Số đo 3 vòng: ${bustLabel} ${stats.bust}cm - Eo thon nhỏ ${stats.waist}cm - Mông cong ${stats.hip}cm.
    - Tỷ lệ cơ thể: Chân dài, tỷ lệ vàng, nhấn mạnh sự gợi cảm một cách nghệ thuật (sensual but artistic, not NSFW).
    - Nếu là nữ: Vẽ đường cong cơ thể mềm mại, y phục ôm sát hoặc hở vai/lưng tinh tế để lộ vẻ đẹp.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // We use generateContent for 2.5 flash image as per instructions
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Không tìm thấy hình ảnh trong phản hồi.");
  } catch (error) {
    console.error("Lỗi tạo nhân vật:", error);
    throw error;
  }
};

export const generateItemImage = async (
  name: string,
  type: string,
  description: string
): Promise<string> => {
  const ai = getClient();

  const prompt = `
    Vẽ minh họa vật phẩm game/truyện tranh (Game Asset/Icon) phong cách Tiên Hiệp Huyền Ảo (Fantasy Cultivation Artifact).
    
    THÔNG TIN VẬT PHẨM:
    - Tên: ${name}
    - Loại: ${type}
    - Mô tả chi tiết: ${description}
    
    PHONG CÁCH:
    - Chất lượng cao, chi tiết tinh xảo (Intricate details).
    - Hiệu ứng phát sáng huyền bí (Magical glow, aura).
    - Góc nhìn: Cận cảnh, đặt trên nền đơn giản hoặc hiệu ứng phép thuật (Isolated centered composition).
    - Màu sắc: Rực rỡ, sang trọng, mang đậm chất cổ trang thần thoại.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Không tìm thấy hình ảnh vật phẩm.");
  } catch (error) {
    console.error("Lỗi tạo vật phẩm:", error);
    throw error;
  }
};

export const generateComicPanel = async (
  prompt: string,
  characters: Character[]
): Promise<string> => {
  const ai = getClient();

  const parts: any[] = [];

  // 1. Add reference images for characters mentioned or included
  let characterContext = "";
  
  characters.forEach((char, index) => {
    // Add image part
    const base64Data = char.imageUrl.split(',')[1]; // Remove data:image/png;base64, prefix
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png' // Assuming png for simplicity, logic could be added to detect
      }
    });
    characterContext += `Nhân vật tham chiếu ${index + 1}: Tên "${char.name}" (${char.stats?.gender || 'Nữ'}). `;
    
    // Add item context if relevant (optional enhancement)
    if (char.items && char.items.length > 0) {
       characterContext += `Có mang theo: ${char.items.map(i => i.name).join(', ')}. `;
    }
  });

  // 2. Add the main text prompt
  const fullPrompt = `
    Vẽ một khung truyện tranh phong cách Manhua Tiên Hiệp/Sắc Hiệp (Ancient Cultivation Manhua).
    
    THÔNG TIN NHÂN VẬT THAM CHIẾU (Đã đính kèm ảnh bên trên):
    ${characterContext}
    
    NỘI DUNG CẦN VẼ (Bối cảnh cổ trang/tu tiên):
    ${prompt}
    
    YÊU CẦU:
    - Nếu trong nội dung có nhắc đến tên nhân vật tham chiếu, hãy vẽ nhân vật đó giống hệt ảnh mẫu (khuôn mặt, tóc, vóc dáng, trang phục cổ trang).
    - Phong cách nghệ thuật: Manhua Sắc Hiệp, nét vẽ đẹp, chau chuốt, ánh sáng lung linh (ethereal lighting), màu sắc phong phú.
    - Thể hiện sự gợi cảm tinh tế (nếu phù hợp với nội dung) nhưng không thô tục.
    - Bối cảnh nền: Chi tiết, mang đậm chất cổ phong (đình đài lầu các, núi non, rừng trúc...).
  `;

  parts.push({ text: fullPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        // You might add safety settings or generation config here if needed
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Không tìm thấy hình ảnh truyện trong phản hồi.");
  } catch (error) {
    console.error("Lỗi tạo truyện:", error);
    throw error;
  }
};