import { ICommand } from '@nestjs/cqrs';
//oauth는 바깥 모듈인데 인프라 아닐까?
export class GoogleOauthCommand implements ICommand {
  constructor(readonly accessToken: string) {}
}
