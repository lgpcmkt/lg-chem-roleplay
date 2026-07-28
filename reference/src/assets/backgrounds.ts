import waitingRoomClinicImg from './images/korean_waiting_room_1785058491318.jpg';
import doctorOfficeClinicImg from './images/korean_doctor_office_1785058505636.jpg';
import waitingRoomHospitalImg from './images/korean_university_hospital_waiting_room_1785070063098.jpg';
import doctorOfficeHospitalImg from './images/korean_university_hospital_doctor_office_1785070077610.jpg';

export const BACKGROUND_IMAGES = {
  waitingRoomClinic: waitingRoomClinicImg,
  doctorOfficeClinic: doctorOfficeClinicImg,
  waitingRoomHospital: waitingRoomHospitalImg,
  doctorOfficeHospital: doctorOfficeHospitalImg,
  waitingRoom: waitingRoomClinicImg,
  doctorOffice: doctorOfficeClinicImg,
};

export function getHospitalBackgrounds(hospitalName: string = '') {
  const isHospital = hospitalName.includes('대학병원') || (hospitalName.includes('병원') && !hospitalName.includes('의원'));
  return {
    waitingRoom: isHospital ? BACKGROUND_IMAGES.waitingRoomHospital : BACKGROUND_IMAGES.waitingRoomClinic,
    doctorOffice: isHospital ? BACKGROUND_IMAGES.doctorOfficeHospital : BACKGROUND_IMAGES.doctorOfficeClinic,
  };
}
