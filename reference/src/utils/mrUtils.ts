export function getMrTitle(name?: string): string {
  if (!name || name === '영업사원') return 'MR';
  const trimmed = name.trim();
  if (!trimmed) return 'MR';
  
  // 만약 2자 이상의 한국 이름이면 첫 글자 성을 따서 "신 MR", "김 MR" 형태로 반환
  const lastName = trimmed[0];
  return `${lastName} MR`;
}

export function formatDoctorGreeting(doctorId: string, initialMessage: string, mrName?: string): string {
  const nameToUse = mrName?.trim() ? mrName.trim() : '담당자';
  const mrTitle = `${nameToUse} 담당자님`;

  switch (doctorId) {
    case 'kim_min_hee':
    case 'kim_tae_woo':
      return `아 네, 어서 오세요 ${mrTitle}. 저희 원장님이 아직 진료 중이셔서.. 짧게만 들을 수 있어요. 오늘 제미다파 어떤 내용을 디테일하러 오셨나요?`;
    case 'park_jin_ryo':
      return `어 오셨어요, ${mrTitle}. 내과 의사로서 임상 데이터 없는 약은 안 씁니다. 오늘 제미다파 어떤 내용을 디테일하러 오셨나요?`;
    case 'lee_hak_sul':
      return `들어오세요, ${mrTitle}. 외래 중간이라 2분밖에 없습니다. 오늘 제미다파 어떤 내용을 디테일하러 오셨나요?`;
    case 'choi_sil_li':
      return `네, 오셨어요 ${mrTitle}? 바쁜 시간 내는 건데.. 오늘 제미다파 어떤 내용을 디테일하러 오셨나요?`;
    case 'jung_sim_jang':
      return `아 어서 오세요 ${mrTitle}. 제가 순환기라 당뇨약 세부 기전은 잘 모르지만 SGLT-2i는 자주 쓰는데, 오늘 제미다파 어떤 내용을 디테일하러 오셨나요?`;
    default:
      return initialMessage.replace('{mrTitle}', mrTitle);
  }
}
