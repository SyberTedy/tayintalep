export interface UserLoginDTO {
  registratioNumber: number;
  password: string;
}

export interface UserRegisterDTO {
  registratioNumber: number;
  tcNo: string;
  name: string;
  surname: string;
  eMail: string;
  phone: string;
  titleId: number;
  password: string;
  activeCourthouseId: number;
}

export interface User {
  id: number;
  registrationNumber: number;
  tcNo: string;
  name: string;
  surname: string;
  eMail: string;
  phone: string;
  title: string;
  titleName?: string;
  activeCourthouse: string;
  createdAt: string;
  permissions: string[];
} 

export interface Courthouse {
  id: number;
  name: string;
}

export interface Title {
  id: number;
  name: string;
}

export interface TransferRequestType {
  id: number;
  name: string;
}

export interface TransferRequestStatus {
  id: number;
  name: string;
}

export interface TransferRequest {
  id: number;
  userId: number;
  typeId: number;
  description: string;
  statuId: number;
  sources: number[][];
  preferences: CourthousePreference[];
  createdAt: string;
  ApprovedCourthousePreferenceId?: number;
}

export interface CourthousePreference {
  id: number;
  courthouseId: number;
  transferRequestId: number;
  preferenceOrder: number;

  
}

export interface UpdateTransferRequestDTO {
  statuId: number;
  approvedCourthousePreferenceId?: number;
}

export interface LogEntry {
  id: number;
  registratioNumber: number;
  actionName: string;
  level: string;
  message: string;
  date: string;
  ipAddress: string;
  controllerName: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface UserPermissionClaim {
  id: number;
  userId: number;
  permissionId: number;
  userName?: string;
  permissionName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
  permissions: string[];
}

export interface CreateTransferRequestDTO {
  TypeId: number;
  Description: string;
  PreferenceIds: number[];
  Sources: File[];
}