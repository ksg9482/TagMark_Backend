import * as winston from 'winston';
import { utilities, WinstonModule } from 'nest-winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import { Module } from '@nestjs/common';

const logDir = __dirname + '/../../logs';

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: logDir + `/${level}`,
    filename: `%DATE%.${level}.log`,
    zippedArchive: true,
  };
};

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
  })(),
);

const prettyFormat = winston.format.combine(
  baseFormat,
  utilities.format.nestLike('Tag-Mark', { //로그 출처인 appName('앱이름') 설정
    prettyPrint:true
  })
);

@Module({
  imports: [
    WinstonModule.forRoot({
      transports:[
        new winston.transports.Console({
          level: 'silly', //process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: prettyFormat
        }),
        new winstonDaily(dailyOptions('log')),
        new winstonDaily(dailyOptions('info')),
        new winstonDaily(dailyOptions('warn')),
        new winstonDaily(dailyOptions('error')),
      ]
    })
  ]
})
export class WinstonDailyModule {}  