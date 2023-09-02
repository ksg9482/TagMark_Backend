import { LoggerService, LogLevel } from '@nestjs/common';
export class CustomLoggerService implements LoggerService {
  debug(message: any, ...optionalParams: any[]): any {
    console.log(message);
  }

  error(message: any, ...optionalParams: any[]): any {
    console.log(message);
  }

  log(message: any, ...optionalParams: any[]): any {
    console.log(message);
  }

  verbose(message: any, ...optionalParams: any[]): any {
    console.log(message);
  }

  warn(message: any, ...optionalParams: any[]): any {
    console.log(message);
  }
}
