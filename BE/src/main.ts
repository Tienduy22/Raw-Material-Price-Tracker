import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: config.get('CLIENT_URL'),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Raw Material Price Tracker')
    .setDescription('API quản lý giá nguyên liệu cho tiểu thương')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập Access Token vào đây',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // giữ token sau khi reload trang
    },
  });


  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);

  logger.log(`Server đang chạy tại http://localhost:${port}/api/v1`);
  logger.log(`Swagger docs tại http://localhost:${port}/api/docs`);
}

bootstrap();