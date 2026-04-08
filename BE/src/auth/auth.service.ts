import { ConflictException, Injectable } from "@nestjs/common";
import { AuthRepository } from "./auth.repository";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";
import { RegisterDTO } from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import { LoginDTO } from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwt: JwtService,
        private readonly config: ConfigService
    ) {}

    private generateAccessToken(user: {
        id: string,
        email: string,
        role: string,
        businessId: string
    }) {
        return this.jwt.sign(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
                businessId: user.businessId
            },
            {
                secret: this.config.getOrThrow<string>('JWT_SECRET'),
                expiresIn: parseInt(this.config.getOrThrow<string>('JWT_EXPIRES_IN'), 10) * 60 * 1000
            }
        )
    }

    private generateRefreshToken(user: {id: string}) {
        return this.jwt.sign(
            {
                sub: user.id
            },
            {
                secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn: parseInt(this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'), 10) * 24 * 60 * 60 * 1000
            }
        )
    }

    async register(data: RegisterDTO) {
        const existingUser = await this.authRepository.findUserByEmail(data.email)
        if(existingUser) {
            throw new ConflictException('Email đã được sử dụng')
        }

        const passwordHash = await bcrypt.hash(data.password, 10)
        const user = await this.authRepository.createBusinessAndOwner({
            businessName: data.businessName,
            fullName: data.fullName,
            email: data.email,
            passwordHash
        })

        const accessToken = this.generateAccessToken(user)
        const refreshToken = this.generateRefreshToken(user)
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                businessId: user.businessId
            }
        }
    }

    async login(data: LoginDTO) {
        const user =  await this.authRepository.findUserByEmail(data.email)
        if(!user) {
            throw new ConflictException('Email hoặc mật khẩu không đúng')
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)
        if(!isPasswordValid) {
            throw new ConflictException('Email hoặc mật khẩu không đúng')
        }

        const accessToken = this.generateAccessToken(user)
        const refreshToken = this.generateRefreshToken(user)

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                businessId: user.businessId
            }
        }
    }

    async refresh(userId: string) {
        const user = await this.authRepository.findUserById(userId)
        if(!user) {
            throw new ConflictException('Tài khoản không tồn tại')
        }

        const accessToken = this.generateAccessToken(user);
        return {
            accessToken
        }
    }
}