import { User } from '../domain/user';
import { UserRoleEnum, UserTypeEnum } from '../interface';
describe('Tag', () => {
  it('User는 id, email, nickName, password, UserRole, UserType을 보유한다.', () => {
    const testUserRole = UserRoleEnum.USER;
    const testUserType = UserTypeEnum.BASIC;
    const user = User.from({
      id: 'testId',
      email: 'test@test.com',
      nickname: 'testNickname',
      password: 'testPassword',
      role: testUserRole,
      type: testUserType,
    });

    expect(user.id).toBe('testId');
    expect(user.email).toBe('test@test.com');
    expect(user.nickname).toBe('testNickname');
    expect(user.password).toBe('testPassword');
    expect(user.role).toBe('USER');
    expect(user.type).toBe('BASIC');
  });

  it('nickName을 변경할 수 있다', () => {
    const testUserRole = UserRoleEnum.USER;
    const testUserType = UserTypeEnum.BASIC;
    const user = User.from({
      id: 'testId',
      email: 'test@test.com',
      nickname: 'testNickname',
      password: 'testPassword',
      role: testUserRole,
      type: testUserType,
    });

    user.updateNickName('changedNickname');
    expect(user.nickname).toBe('changedNickname');
  });

  it('password를 변경할 수 있다', () => {
    const testUserRole = UserRoleEnum.USER;
    const testUserType = UserTypeEnum.BASIC;
    const user = User.from({
      id: 'testId',
      email: 'test@test.com',
      nickname: 'testNickname',
      password: 'testPassword',
      role: testUserRole,
      type: testUserType,
    });

    user.updatePassword('changedPassword');
    expect(user.password).toBe('changedPassword');
  });
});
