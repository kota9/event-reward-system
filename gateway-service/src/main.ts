import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ConfigModule.forRoot({ isGlobal: true }) 가 AppModule에 설정돼 있어야 합니다.
  const config = app.get(ConfigService);
  const port = parseInt(config.get<string>('GATEWAY_PORT', '3000'), 10);
  await app.listen(port);
  console.log(`Gateway service is running on: http://localhost:${port}`);
}
bootstrap();
