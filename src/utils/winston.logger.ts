import { utilities, WinstonModule } from "nest-winston";
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';

const env = process.env.NODE_ENV;
const logDir = __dirname + '/../../../logs';

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: logDir + `/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 30, //30일치 로그파일 저장
    zippedArchive: true, // 로그가 쌓이면 압축하여 관리
  };
};
export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: env === 'production' ? 'http' : 'silly',
      // production 환경이라면 http, 개발환경이라면 모든 단계를 로그
      format:
        env === 'production'
      // production 환경은 자원을 아끼기 위해 simple 포맷 사용
          ? winston.format.simple() 
          : winston.format.combine(
              winston.format.timestamp(),
              utilities.format.nestLike('Tag-Mark', {
                prettyPrint: true, // nest에서 제공하는 옵션. 로그 가독성을 높여줌
              }),
            ),
    }),

    // info, warn, error 로그는 파일로 관리
    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('warn')),
    new winstonDaily(dailyOptions('error')),
    new winstonDaily(dailyOptions('http')),
    new winstonDaily(dailyOptions('verbose')),
    new winstonDaily(dailyOptions('debug')),
    new winstonDaily(dailyOptions('silly')),
  ],
});