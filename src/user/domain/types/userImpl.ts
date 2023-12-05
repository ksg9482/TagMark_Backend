import { UserRole } from './userRole';
import { UserType } from './userType';

export interface UserImpl {
  id: string;
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
  type: UserType;
  updateNickName(nickname: string): void;
  updatePassword(password: string): void;
}
