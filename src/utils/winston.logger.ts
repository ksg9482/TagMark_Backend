import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import * as winstonDaily from 'winston-daily-rotate-file';

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

const splunkFormat = winston.format.combine(
  baseFormat,
  winston.format.json(),
);

const prettyFormat = winston.format.combine(
  baseFormat,
  winston.format.prettyPrint(),
);

export const winstonLogger = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL,
  format: process.env.PRETTY_LOGS ? prettyFormat : splunkFormat,
  transports: [
    new winston.transports.Console(),
    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('warn')),
    new winstonDaily(dailyOptions('error'))
  ],

});