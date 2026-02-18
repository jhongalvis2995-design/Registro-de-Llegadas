
export type RegistrationStatus = 'Llegada normal' | 'Retardo' | 'Registro suspendido';

export type UserRole = 'admin' | 'supervisor' | 'auditor';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  employeeId: string;
  active: boolean;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  post: string;
  timestamp: string;
  date: string;
  time: string;
  status: 'Llegada normal' | 'Retardo';
  registeredBy: string;
  isExtension?: boolean;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export interface ScheduleRule {
  start: string; // HH:mm:ss
  end: string;   // HH:mm:ss
  status: RegistrationStatus;
}

export type ViewState = 'scanner' | 'dashboard' | 'personnel' | 'history' | 'activity_log';
