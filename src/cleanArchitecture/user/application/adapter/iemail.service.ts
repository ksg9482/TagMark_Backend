export interface EmailService {
  sendMemberJoinVerification: (
    email: any,
    signupVerifyToken: any,
  ) => Promise<void>;
}
