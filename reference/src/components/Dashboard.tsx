import React from 'react';
import { DoctorPersona } from '../types';
import { DOCTOR_3D_IMAGES } from '../assets/doctorImages';
import { Sparkles, ChevronRight, User, LogOut } from 'lucide-react';
import { EmployeeInfo } from './EmployeeLoginModal';

interface DashboardProps {
  doctors: DoctorPersona[];
  selectedDoctorId: string;
  setSelectedDoctorId: (id: string) => void;
  onStartRoleplay: () => void;
  employeeInfo: EmployeeInfo | null;
  onChangeEmployee: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  doctors,
  selectedDoctorId,
  setSelectedDoctorId,
  onStartRoleplay,
  employeeInfo,
  onChangeEmployee,
}) => {
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* User Employee Info Header Badge */}
        <div className="flex items-center justify-between bg-white px-4 py-3 md:px-5 md:py-3.5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-50 text-[#3182F6] flex items-center justify-center font-bold shrink-0">
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <div className="text-[11px] md:text-xs text-slate-400 font-bold">LG화학 MR 담당자</div>
              <div className="text-xs md:text-sm font-black text-slate-800">
                {employeeInfo?.employeeId ? (
                  <>
                    <span>사번 {employeeInfo.employeeId}</span>
                    <span className="text-slate-400 font-normal ml-1 hidden sm:inline">
                      ({employeeInfo.name} MR)
                    </span>
                  </>
                ) : (
                  <span className="text-rose-500 font-bold">사번 미등록</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onChangeEmployee}
            className="px-2.5 py-1.5 md:px-3 md:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>

        {/* Main Toss-style Hero Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4 max-w-lg text-center md:text-left w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#3182F6] font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>신규 SWITCHING 연구 기반 롤플레이</span>
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              오늘은 어떤 고객에게<br className="hidden md:inline" />
              {' '}제미다파를 디테일해볼까요?
            </h1>

            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
              제미다파의 SWITCHING 연구를 기반으로 제미다파 처방 변경을 유도해보세요.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onStartRoleplay}
                className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-sm md:text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="text-lg md:text-xl">✊</span>
                <span>디테일 시작하기</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Selected Real Doctor Avatar Preview Frame */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-blue-100 shadow-xl bg-slate-100 relative">
              <img
                src={DOCTOR_3D_IMAGES[selectedDoctor.id]}
                alt={selectedDoctor.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-2.5 text-center">
              <div className="text-slate-900 font-bold text-sm md:text-base">
                {selectedDoctor.name} {selectedDoctor.title}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {selectedDoctor.hospital}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Persona Selection */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              롤플레이 의사 선택
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              5명의 의사 페르소나
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-3.5">
            {doctors.map((doc) => {
              const isSelected = doc.id === selectedDoctorId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`cursor-pointer rounded-2xl p-3 md:p-4 transition-all border flex flex-col items-center text-center space-y-2 ${
                    isSelected
                      ? 'bg-white border-[#3182F6] ring-2 ring-blue-500/10 shadow-md scale-[1.02]'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                    <img
                      src={DOCTOR_3D_IMAGES[doc.id]}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#3182F6] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                        ✓
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs md:text-sm text-slate-900">
                      {doc.name} {doc.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                      {doc.hospital}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
