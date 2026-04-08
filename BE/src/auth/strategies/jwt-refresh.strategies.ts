import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.refreshToken ?? null,
            ]),
            secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
            ignoreExpiration: false,
            passReqToCallback: true
        })
    }

    async validate(req: Request, payload: {sub: string}) {
        const user = await this.prisma.user.findUnique({
            where: {id: payload.sub}
        })

        if(!user) {
            throw new UnauthorizedException('Tài khoản không tồn tại')
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            businessId: user.businessId
        }
    }
}