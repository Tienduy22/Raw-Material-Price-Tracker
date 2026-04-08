import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {email}
        })
    }

    async findUserById(id: string) {
        return this.prisma.user.findUnique({
            where: {id}
        })
    }

    async createBusinessAndOwner(data: {
        businessName: string
        fullName: string,
        email: string,
        passwordHash: string
    }) {
        return this.prisma.$transaction(async (prisma) => {
            const business = await prisma.business.create({
                data: {
                    name: data.businessName
                }
            })
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    fullName: data.fullName,
                    passwordHash: data.passwordHash,
                    role: 'OWNER',
                    businessId: business.id
                }
            })
            return user 
        })
    }
}