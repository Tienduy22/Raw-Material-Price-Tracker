import { HttpStatus } from "@nestjs/common"

export class ApiResponse<T = null> {
    success: boolean
    statusCode: number
    message: string
    data: T | null
    timestamp: string

    constructor(success: boolean, statusCode: number, message: string, data: T | null = null) {
        this.success = success
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.timestamp = new Date().toISOString()
    }

    // Success

    static ok<T>(data: T, message = 'Thành công'): ApiResponse<T> {
        return new ApiResponse(true, HttpStatus.OK, message, data)
    }

    static created<T>(data: T, message = 'Tạo mới thành công'): ApiResponse<T> {
        return new ApiResponse(true, HttpStatus.CREATED, message, data)
    }

    // Client Errors 

    static badRequest(message = 'Dữ liệu không hợp lệ'): ApiResponse<null> {
        return new ApiResponse(false, HttpStatus.BAD_REQUEST, message, null);
    }

    static unauthorized(message = 'Bạn chưa đăng nhập'): ApiResponse<null> {
        return new ApiResponse(false, HttpStatus.UNAUTHORIZED, message, null);
    }

    static forbidden(message = 'Bạn không có quyền thực hiện thao tác này'): ApiResponse<null> {
        return new ApiResponse(false, HttpStatus.FORBIDDEN, message, null);
    }

    static notFound(message = 'Không tìm thấy dữ liệu'): ApiResponse<null> {
        return new ApiResponse(false, HttpStatus.NOT_FOUND, message, null);
    }

    static conflict(message = 'Dữ liệu đã tồn tại'): ApiResponse<null> {
        return new ApiResponse(false, HttpStatus.CONFLICT, message, null);
    }

    static unprocessable(message = 'Không thể xử lý yêu cầu'): ApiResponse<null> {
        return new ApiResponse(false, HttpStatus.UNPROCESSABLE_ENTITY, message, null);
    }

    //  Server Errors 

    static internal(message = 'Lỗi hệ thống, vui lòng thử lại sau'): ApiResponse<null> {
        return new ApiResponse(false, HttpStatus.INTERNAL_SERVER_ERROR, message, null);
    }

    static serviceUnavailable(message = 'Dịch vụ tạm thời không khả dụng'): ApiResponse<null> {
        return new ApiResponse(false, HttpStatus.SERVICE_UNAVAILABLE, message, null);
    }
}