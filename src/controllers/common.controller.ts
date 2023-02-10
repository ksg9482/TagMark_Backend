import { Controller, Get, HttpException, HttpStatus, Inject, Logger, LoggerService} from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('Common')
@Controller('/')
export class CommonController {
    constructor(
        @Inject(Logger) private readonly logger: LoggerService
    ) { };
    @ApiOperation({ summary: '서버 연결 확인 API', description: '서버 연결을 확인한다.' })
    @ApiCreatedResponse({ description: '서버에 접근할 수 있으면 {success:true}를 반환한다.'})
    @Get('/')
    async connectCheck() {
        try {
            return {success:true};
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

}