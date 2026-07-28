import clinicDoorImg from './images/clinic_door_1785055601705.jpg';
import doctorParkRealImg from './images/doctor_real_park_1785057865210.jpg';
import doctorKimRealImg from './images/doctor_real_kim_1785057881861.jpg';
import doctorLeeRealImg from './images/doctor_real_lee_1785057895313.jpg';
import doctorChoiRealImg from './images/doctor_real_choi_1785057908409.jpg';
import doctorFemaleMinImg from './images/doctor_female_min_1785069465814.jpg';
import doctorSeniorJungImg from './images/doctor_senior_jung_1785069480316.jpg';

export const CLINIC_DOOR_IMAGE = clinicDoorImg;

export const DOCTOR_3D_IMAGES: Record<string, string> = {
  kim_min_hee: doctorFemaleMinImg,
  kim_tae_woo: doctorFemaleMinImg,
  park_jin_ryo: doctorParkRealImg,
  lee_hak_sul: doctorLeeRealImg,
  choi_sil_li: doctorChoiRealImg,
  jung_sim_jang: doctorSeniorJungImg,
  // legacy fallbacks
  kim_won_jang: doctorFemaleMinImg,
  lee_gyo_su: doctorLeeRealImg,
  choi_kkan_kkan: doctorChoiRealImg,
};

