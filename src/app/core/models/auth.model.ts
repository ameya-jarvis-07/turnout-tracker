export interface LoginRequest {
  email: string;
  password: string;
  deviceFingerprintHash: string;
  deviceName: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  deviceChangeRequired: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'Student' | 'Faculty' | 'Admin';
}

export interface DeviceChangeRequestDto {
  requestId?: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  oldDeviceId?: number;
  newDeviceFingerprintHash: string;
  newDeviceName?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  requestedAt?: Date;
  reviewedByAdminId?: number;
  reviewedAt?: Date;
  reviewNotes?: string;
}
