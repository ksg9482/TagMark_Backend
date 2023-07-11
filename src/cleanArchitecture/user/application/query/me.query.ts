import { ICommand } from '@nestjs/cqrs';

export class MeQuery implements ICommand {
  constructor(readonly userId: number) {}
}
