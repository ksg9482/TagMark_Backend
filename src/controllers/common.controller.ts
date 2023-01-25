import { Controller, Get, HttpException, HttpStatus, Inject, Logger, LoggerService} from "@nestjs/common";
@Controller('/')
export class CommonController {
    constructor(
        @Inject(Logger) private readonly logger: LoggerService
    ) { };

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