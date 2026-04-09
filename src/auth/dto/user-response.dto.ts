// src/auth/dto/user-response.dto.ts
export class UserResponseDto {
  id: number;
  email?: string;
  phone?: string;
  displayName?: string;
  avatarUrl?: string;
  locale: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
} 