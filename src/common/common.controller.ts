import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiDefaultResponse, ApiOperation } from '@nestjs/swagger';

@Controller('common')
export class CommonController {
    @Get('/')
    @ApiOperation({ summary: '연결확인 API', description: '서버와의 연결을 확인한다.' })
    @ApiDefaultResponse({ description: '서버와의 연결을 확인한다.' })
    async health(
        ){
        try {
            console.log('호출')
            return {message:'connected'}
        } catch (error) {
            throw new InternalServerErrorException();
        }
        
    }
}
