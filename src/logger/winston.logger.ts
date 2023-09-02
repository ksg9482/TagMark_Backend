import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import * as winstonDaily from 'winston-daily-rotate-file';

//logger는 사실상 모든 영역에서 사용된다. module로 DI하는 것보다 전역으로 적용하는 편이 더 낫다고 생각한다.
const env = process.env.NODE_ENV;
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

const splunkFormat = winston.format.combine(baseFormat, winston.format.json());

const prettyFormat = winston.format.combine(
  baseFormat,
  winston.format.prettyPrint(),
);

export const winstonLogger = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL,
  format: process.env.PRETTY_LOGS ? prettyFormat : prettyFormat, //splunkFormat,
  transports: [
    new winston.transports.Console(),
    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('warn')),
    new winstonDaily(dailyOptions('error')),
  ],
});
