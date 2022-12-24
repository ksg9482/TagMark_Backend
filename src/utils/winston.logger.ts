import { utilities as nestWinstonModuleUtilities, utilities, WinstonModule } from "nest-winston";
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';

const env = process.env.NODE_ENV;
const logDir = __dirname + '/../../logs';

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

export const winstonLogger = {
    logger: WinstonModule.createLogger({
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
                    utilities.format.nestLike('프로젝트이름', {
                      prettyPrint: true, // nest에서 제공하는 옵션. 로그 가독성을 높여줌
                    }),
                  ),
          }),
        new winstonDaily(dailyOptions('info')),
        new winstonDaily(dailyOptions('warn')),
        new winstonDaily(dailyOptions('error'))
      ],
    })
  }