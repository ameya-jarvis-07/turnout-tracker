export interface UserDto {
  userId: number;
  fullName: string;
  email: string;
  role: 'Student' | 'Faculty' | 'Admin';
  registeredDeviceId?: number;
  createdAt: Date;
}

export interface CurrentUser extends UserDto {
  token: string;
}
