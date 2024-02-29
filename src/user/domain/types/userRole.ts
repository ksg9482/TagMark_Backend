export const UserRoleEnum = {
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;

export type UserRole = keyof typeof UserRoleEnum;
