export class AdminResponseDto {
  id: number;
  name?: string;
  email?: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
}
