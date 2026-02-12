import React, { useState, useEffect, useRef } from 'react';
import { Character, ComicPanel, BackupData } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface Props {
  characters: Character[];
  panels: ComicPanel[];
  onRestore: (data: BackupData) => void;
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const BACKUP_FILE_NAME = 'manhua_maker_backup.json';

const CloudStorage: React.FC<Props> = ({ characters, panels, onRestore }) => {
  // Local Storage Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive State
  const [clientId, setClientId] = useState(() => localStorage.getItem('gdrive_client_id') || '');
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  // --- LOCAL STORAGE FUNCTIONS (OFFLINE) ---

  const handleLocalBackup = () => {
    try {
      setLoading(true);
      const backupData: BackupData = {
        characters,
        panels,
        timestamp: Date.now(),
        version: '1.0'
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", url);
      downloadAnchorNode.setAttribute("download", `manhua_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      URL.revokeObjectURL(url);
      
      setStatus(`Đã tải file sao lưu về máy thành công!`);
    } catch (e: any) {
      setStatus('Lỗi tạo file: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsedData = JSON.parse(content) as BackupData;
            
            if (parsedData.characters && Array.isArray(parsedData.characters)) {
                onRestore(parsedData);
                setStatus(`Khôi phục thành công! (${parsedData.characters.length} nhân vật)`);
            } else {
                setStatus('File không đúng định dạng sao lưu.');
            }
        } catch (err) {
            setStatus('Lỗi: File bị hỏng hoặc không phải JSON.');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    reader.readAsText(fileObj);
  };

  // --- GOOGLE DRIVE FUNCTIONS ---

  const handleSaveClientId = () => {
    const trimmedId = clientId.trim();
    if (!trimmedId) {
        setStatus('Vui lòng nhập Client ID hợp lệ.');
        return;
    }
    localStorage.setItem('gdrive_client_id', trimmedId);
    setClientId(trimmedId); // Trigger useEffect re-run
    setStatus('Đã lưu ID. Đang khởi tạo kết nối Drive... (Không reload)');
  };

  useEffect(() => {
    if (!clientId) return;

    const initializeGapi = async () => {
      if (!window.gapi) return;
      try {
          // Wait for gapi to load
          await new Promise((resolve) => window.gapi.load('client', resolve));
          await window.gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
          });
      } catch (err) {
          console.error('GAPI init error', err);
      }
    };

    const initializeGis = () => {
      if (!window.google || !window.google.accounts) return;
      try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: (response: any) => {
              if (response.error !== undefined) {
                  setStatus('Lỗi xác thực: ' + response.error);
                  throw (response);
              }
              setIsAuthenticated(true);
              setStatus('Đã kết nối Google Drive! Sẵn sàng sao lưu.');
            },
          });
          setTokenClient(client);
      } catch (err) {
          console.error('GIS init error', err);
          setStatus('Lỗi cấu hình Google Auth. Kiểm tra Client ID.');
      }
    };

    // Retry logic if scripts aren't ready
    const checkAndInit = () => {
        if (window.gapi && window.google) {
            initializeGapi().then(() => initializeGis());
        } else {
            setTimeout(checkAndInit, 1000);
        }
    };

    checkAndInit();
  }, [clientId]);

  const handleAuthClick = () => {
    if (tokenClient) {
      // Force prompt to ensure we get a fresh token if needed
      tokenClient.requestAccessToken({prompt: ''}); 
    } else {
      setStatus('Đang khởi tạo thư viện Google... vui lòng đợi.');
    }
  };

  const handleBackupDrive = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setStatus('Đang chuẩn bị dữ liệu...');

    try {
      const backupData: BackupData = { characters, panels, timestamp: Date.now(), version: '1.0' };
      const fileContent = JSON.stringify(backupData);
      
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";
      const contentType = 'application/json';
      const metadata = { name: BACKUP_FILE_NAME, mimeType: contentType };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n\r\n' +
        fileContent +
        close_delim;

      await window.gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
        body: multipartRequestBody
      });
      setStatus('Thành công! File đã được lưu vào Google Drive của bạn.');
    } catch (e: any) {
      setStatus('Lỗi tải lên: ' + (e.result?.error?.message || e.message));
      // If token expired, force re-auth next time
      if (e.status === 401) setIsAuthenticated(false); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 h-full overflow-y-auto no-scrollbar">
       <div className="flex items-center mb-6 sticky top-0 bg-background/95 backdrop-blur z-20 py-2">
         <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
             Quản Lý Dữ Liệu
         </h1>
       </div>

       <div className="space-y-8">
          
          {/* LOCAL FILE STORAGE - PRIMARY OPTION */}
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-600 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl">📱</span>
              </div>
              <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                  <span>💾</span> Lưu Trữ Trên Máy
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                  Xuất toàn bộ dữ liệu ra file .json. An toàn và không cần mạng.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleLocalBackup}
                    disabled={loading}
                    className="bg-primary hover:bg-violet-600 text-white p-3 rounded-xl font-bold text-sm shadow-lg flex flex-col items-center gap-1 border border-white/10 transition-transform active:scale-95"
                  >
                      <span className="text-xl">⬇️ Tải Về</span>
                      <span className="text-[10px] opacity-80 font-normal">Lưu vào điện thoại</span>
                  </button>

                  <button 
                    onClick={handleLocalRestoreClick}
                    disabled={loading}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl font-bold text-sm shadow-lg flex flex-col items-center gap-1 border border-white/10 transition-transform active:scale-95"
                  >
                      <span className="text-xl">📂 Mở File</span>
                      <span className="text-[10px] opacity-80 font-normal">Khôi phục dữ liệu</span>
                  </button>
                  <input 
                      type="file" 
                      accept=".json" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      className="hidden" 
                  />
              </div>
          </div>

          {/* STATUS CONSOLE */}
          <div className="bg-black/40 p-4 rounded-lg border border-gray-700 font-mono text-xs text-green-400 min-h-[60px] flex items-center leading-relaxed shadow-inner">
              {loading ? (
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                      <span>Đang xử lý dữ liệu...</span>
                  </div>
              ) : (status || "Sẵn sàng.")}
          </div>

          <div className="border-t border-gray-700/50 my-2"></div>

          {/* GOOGLE DRIVE STORAGE - ADVANCED */}
          <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-800">
             <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-gray-400 text-sm flex items-center gap-2">
                     <span>☁️</span> Google Drive (Cần Cấu Hình)
                 </h3>
                 <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-[10px] text-blue-400 underline"
                 >
                    {showGuide ? 'Ẩn Hướng Dẫn' : 'Hướng Dẫn Lấy ID'}
                 </button>
             </div>
             
             {showGuide && (
                 <div className="mb-4 bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 text-[10px] text-gray-300 space-y-1">
                     <p>1. Vào <b>Google Cloud Console</b> &gt; APIs & Services &gt; Credentials.</p>
                     <p>2. Tạo <b>OAuth Client ID</b> (Web application).</p>
                     <p>3. Thêm URL hiện tại vào <b>Authorized JavaScript origins</b>.</p>
                     <p>4. Copy <b>Client ID</b> và dán vào bên dưới.</p>
                     <p className="text-red-400 pt-1">*Lưu ý: Không dùng Service Account vì lý do bảo mật.</p>
                 </div>
             )}
             
             {!isAuthenticated ? (
                 <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <input 
                        type="text" 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Dán Client ID tại đây (ví dụ: 123...apps.googleusercontent.com)"
                        className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs text-white focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                        <button onClick={handleSaveClientId} className="bg-gray-700 text-xs px-3 py-2.5 rounded-lg text-white font-bold flex-1 border border-white/5 active:bg-gray-600">
                            Lưu & Kết Nối
                        </button>
                        <button 
                            onClick={handleAuthClick} 
                            disabled={!clientId}
                            className="bg-blue-600 text-xs px-3 py-2.5 rounded-lg text-white font-bold flex-1 shadow-lg shadow-blue-900/20 disabled:opacity-50 active:bg-blue-500"
                        >
                            Đăng Nhập Drive
                        </button>
                    </div>
                 </div>
             ) : (
                 <div className="space-y-3 animate-in fade-in">
                     <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg flex items-center justify-between">
                         <span className="text-xs text-green-300 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Đã kết nối Drive
                         </span>
                         <button onClick={() => setIsAuthenticated(false)} className="text-[10px] text-gray-400 hover:text-white underline">Thoát</button>
                     </div>
                     <button 
                        onClick={handleBackupDrive}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/10"
                     >
                        <span>⬆️</span> Sao lưu lên Cloud
                     </button>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default CloudStorage;