export const UserTypeEnum = {
  BASIC: 'BASIC',
  GOOGLE: 'GOOGLE',
} as const;

export type UserType = keyof typeof UserTypeEnum;
