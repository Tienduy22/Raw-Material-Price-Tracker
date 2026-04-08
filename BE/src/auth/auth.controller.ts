import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDTO } from "./dto/register.dto";
import type { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { ApiResponse } from "src/common/responses/api-response";
import { LoginDTO } from "./dto/login.dto";
import { JwtAuthGuard, JwtRefreshGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly config: ConfigService
    ) { }

    private setRefreshTokenCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: this.config.getOrThrow<string>('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: parseInt(this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'), 10) * 24 * 60 * 60 * 1000
        })
    }


    @Post('register')
    @HttpCode(201)
    @ApiOperation({ summary: 'Đăng ký tài khoản + tạo cơ sở kinh doanh' })
    async register(@Body() data: RegisterDTO, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(data)
        this.setRefreshTokenCookie(res, result.refreshToken)
        return ApiResponse.created({
            accessToken: result.accessToken,
            user: result.user
        }, 'Đăng ký thành công')
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Đăng nhập' })
    async login(@Body() data: LoginDTO, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(data)
        this.setRefreshTokenCookie(res, result.refreshToken)
        return ApiResponse.ok({
            accessToken: result.accessToken,
            user: result.user
        }, 'Đăng nhập thành công')
    }

    @Post('refresh')
    @HttpCode(200)
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({ summary: 'Làm mới access token' })
    async refresh(@CurrentUser() user: { id: string }) {
        const result = await this.authService.refresh(user.id)
        return ApiResponse.ok(result, 'Làm mới token thành công')
    }


    @Post('logout')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Đăng xuất' })
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('refresh_token');
        return ApiResponse.ok(null, 'Đăng xuất thành công');
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
    async getMe(@CurrentUser() user: any) {
        return ApiResponse.ok(user, 'Lấy thông tin thành công');
    }
}