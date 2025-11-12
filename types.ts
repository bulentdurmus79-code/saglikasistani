
export enum Role {
  Caregiver = 'Caregiver',
  Patient = 'Patient',
}

export interface Profile {
  id: string;
  name: string;
  role: Role;
  avatar: string; // URL or emoji
}

export enum TaskType {
  Medication = 'Medication',
  Measurement = 'Measurement',
  Activity = 'Activity',
  Appointment = 'Appointment',
  Other = 'Other',
}

export interface Task {
  id: string;
  profileId: string;
  title: string;
  time: string; // HH:mm
  date: string; // YYYY-MM-DD
  type: TaskType;
  isCritical: boolean;
  isCompleted: boolean;
  notes?: string;
  medicationImage?: string; // base64
  stock?: number;
}

export interface FamilyGroup {
  id: string;
  profiles: Profile[];
  tasks: Task[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'base' | 'lg';
  hapticFeedback: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  image?: string; // base64
  isLoading?: boolean;
}
