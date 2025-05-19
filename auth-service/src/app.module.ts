import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';

import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { User, UserSchema } from './users/user.schema';

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true, // 전역으로 사용 가능
      envFilePath: '.env', // 환경변수 파일 경로
    }),

    // MongoDB 연결: URI와 DB 이름 분리해서 사용
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: config.get<string>('DB_NAME'),
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    // Passport 모듈 (JWT 전략 사용)
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT 모듈 설정
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') }, // 토큰 만료 시간 설정
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    UsersController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
  ],
})
export class AppModule {}
