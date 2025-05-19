import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProxyModule } from './proxy.module';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    // .env 로딩 (isGlobal: true 로 전역에서 .env 사용 가능)
    ConfigModule.forRoot({ isGlobal: true }),

    HttpModule, ProxyModule,

    // JwtModule 등록 → JwtService 제공
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '3600s' }, // 토큰 만료 시간 설정
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthGuard, RolesGuard],
})
export class AppModule {}
