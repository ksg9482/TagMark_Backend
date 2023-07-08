import { ICommand } from '@nestjs/cqrs';

export class RefreshCommand implements ICommand {
  constructor(readonly refreshToken: string) {}
}
