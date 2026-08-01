import React, { useEffect, useState } from 'react';
import { UserProgress, EmployeeInfo } from '../types';
import { LogOut } from 'lucide-react';

interface HomeScreenProps {
  employeeInfo: EmployeeInfo;
  onLogout: () => void;
  onSelectTrack: (track: 'hospital' | 'local') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ employeeInfo, onLogout, onSelectTrack }) => {
  const [progress, setProgress] = useState<UserProgress>({ hospital: 0, local: 0 });
  const [selectedTrack, setSelectedTrack] = useState<'hospital' | 'local'>('hospital');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch progress from backend
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/progress/${employeeInfo.employeeId}`);
        if (res.ok) {
          const data = await res.json();
          setProgress(data);
        }
      } catch (err) {
        console.error('Failed to fetch progress', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [employeeInfo.employeeId]);

  const getCharImage = (clearCount: number) => {
    if (clearCount <= 1) return '/images/char_level1.png';
    if (clearCount <= 3) return '/images/char_level2.png';
    if (clearCount === 4) return '/images/char_level3.png';
    return '/images/char_level4.png';
  };

  const getCharDesc = (clearCount: number) => {
    if (clearCount <= 1) return '쩔쩔매는 초보 영업사원';
    if (clearCount <= 3) return '고군분투 중인 영업사원';
    if (clearCount === 4) return '제법 유능해진 영업사원';
    return '능숙한 제미다파 마스터!';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-black font-sans">
        <p>로딩중...</p>
      </div>
    );
  }

  const currentProgress = progress[selectedTrack];

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-white text-black font-sans min-h-screen pt-10">
      
      {/* Header Info */}
      <div className="w-full max-w-sm px-6 flex justify-between items-center mb-8">
        <div className="text-sm font-bold">
          {employeeInfo.name} 님
        </div>
        <button onClick={onLogout} className="p-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          <span className="text-xs">로그아웃</span>
        </button>
      </div>

      {/* Title */}
      <div className="text-2xl font-black mb-8 text-center px-4 leading-tight">
        제미다파 마스터 챌린지
      </div>

      {/* Main Box */}
      <div className="w-full max-w-sm px-6">
        <div className="pixel-box p-6 flex flex-col items-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          
          <div className="flex w-full mb-6 border-2 border-black rounded-lg overflow-hidden font-bold">
            <button 
              className={`flex-1 py-3 text-center transition-colors ${selectedTrack === 'hospital' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              onClick={() => setSelectedTrack('hospital')}
            >
              종합병원
            </button>
            <button 
              className={`flex-1 py-3 text-center border-l-2 border-black transition-colors ${selectedTrack === 'local' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              onClick={() => setSelectedTrack('local')}
            >
              로컬 병의원
            </button>
          </div>

          <div className="text-sm font-bold mb-2">
            진행도: {currentProgress} / 5
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-4 border-2 border-black rounded-full mb-8 overflow-hidden bg-gray-200">
            <div 
              className="h-full bg-black transition-all duration-500" 
              style={{ width: `${(currentProgress / 5) * 100}%` }}
            />
          </div>

          {/* Character Image */}
          <div className="relative mb-4 w-40 h-40 border-2 border-black bg-gray-50 flex items-center justify-center rounded-xl overflow-hidden group">
             <img 
               src={getCharImage(currentProgress)} 
               alt="캐릭터" 
               className="object-contain w-[120%] h-[120%] image-rendering-pixelated group-hover:scale-110 transition-transform" 
               style={{ imageRendering: 'pixelated' }}
             />
             {currentProgress === 5 && (
               <div className="absolute top-2 right-2 text-xl animate-bounce border-2 border-black bg-yellow-300 px-2 font-bold shadow-[2px_2px_0_rgba(0,0,0,1)]">마스터</div>
             )}
          </div>

          <div className="text-sm font-bold mb-8 h-6">
            {getCharDesc(currentProgress)}
          </div>

          <button 
            className="w-full py-4 bg-black text-white font-bold text-lg rounded-xl border-4 border-black hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 relative shadow-[4px_4px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1 active:translate-x-1"
            onClick={() => onSelectTrack(selectedTrack)}
          >
            {selectedTrack === 'hospital' ? '종병' : '로컬'} 롤플레이 시작
          </button>
        </div>
      </div>
    </div>
  );
};
