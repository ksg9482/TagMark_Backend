// export enum UserRole {
//   USER = 'USER',
//   MANAGER = 'MANAGER',
// }
export const UserRoleEnum = {
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;

export type UserRole = keyof typeof UserRoleEnum;
