export interface Patient {
  id?: string;           // optional, because backend generates it
  firstName: string;
  lastName: string;
  dob: string;   
  age?: string;     
  gender: "Male" | "Female" | "Other"| null;
  contact: string;
  address: string;
}