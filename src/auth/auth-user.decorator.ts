import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtService } from "src/jwt/jwt.service";
enum AuthorizationType {
    Bearer = 'Bearer'
}
export const AuthUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        return request.userId;
    }
)