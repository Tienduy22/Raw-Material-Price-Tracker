import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
    @ApiProperty({ example: 'Quán Cafe Minh' })
    @IsString()
    @IsNotEmpty({ message: 'Tên cơ sở không được để trống' })
    businessName: string

    @ApiProperty({ example: 'Nguyen Van A' })
    @IsString()
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    fullName: string

    @ApiProperty({ example: 'example@gmail.com' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string

    @ApiProperty({ example: '123456' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string
}