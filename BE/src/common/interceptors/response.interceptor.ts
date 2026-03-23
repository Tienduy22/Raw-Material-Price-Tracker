import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ApiResponse } from "../responses/api-response";
import { map, Observable } from "rxjs";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
        const statusCode = context.switchToHttp().getResponse().statusCode

        return next.handle().pipe(
            map((data) => {
                if(data instanceof ApiResponse) return data
                const message = statusCode ===201 ? 'Tạo mới thành công' : 'Thành công'
                return new ApiResponse(true, statusCode, message, data ?? null)
            })
        )
    }
}