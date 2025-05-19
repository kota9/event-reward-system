import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { Event, EventSchema } from './events/event.schema';

import { RewardsController } from './rewards/rewards.controller';
import { RewardsService } from './rewards/rewards.service';
import { Reward, RewardSchema } from './rewards/reward.schema';

import { RedemptionsController } from './redemptions/redemptions.controller';
import { RedemptionsService } from './redemptions/redemptions.service';
import { Redemption, RedemptionSchema } from './redemptions/redemption.schema';
import { UserStatsService } from './users/user-stats.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    // 환경변수 로드(.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // JWT 인증 설정
    PassportModule.register({ defaultStrategy: 'jwt' }),  
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),

    // MongoDB 연결 (MONGO_URI, DB_NAME)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: config.get<string>('DB_NAME'),
      }),
      inject: [ConfigService],
    }),

    // 스키마 등록
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: Redemption.name, schema: RedemptionSchema },
    ]),
  ],
  controllers: [
    EventsController,
    RewardsController,
    RedemptionsController,
  ],
  providers: [
    EventsService,
    RewardsService,
    RedemptionsService,
    UserStatsService,
    JwtStrategy,
    RolesGuard,
  ],
})
export class AppModule {}
