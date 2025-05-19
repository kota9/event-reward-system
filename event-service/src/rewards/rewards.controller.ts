import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  // 보상 등록은 OPERATOR, ADMIN 권한만 가능
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createRewardDto: CreateRewardDto) {
    const reward = await this.rewardsService.create(createRewardDto);
    return { message: 'Reward created', reward };
  }

  /** 전체 보상 조회
   * - /rewards
   * - /rewards?eventId=시행된_이벤트_ID
   */
  @Get()
  async findAll(@Query('eventId') eventId?: string) {
    const rewards = await this.rewardsService.findAll(eventId);
    return { rewards };
  }

  // 단일 보상 조회
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reward = await this.rewardsService.findOne(id);
    return { reward };
  }

}
