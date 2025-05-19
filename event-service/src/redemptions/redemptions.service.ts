import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Redemption, RedemptionDocument } from './redemption.schema';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
import { Event, EventDocument } from '../events/event.schema';
import { Reward, RewardDocument } from '../rewards/reward.schema';
import { UserStatsService } from '../users/user-stats.service';

@Injectable()
export class RedemptionsService {
  constructor(
    @InjectModel(Redemption.name) private redemptionModel: Model<RedemptionDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    private userStatsService: UserStatsService,
  ) {}

  /** 보상 요청: 조건 검증, 중복 방지, 상태 기록 */
  async create(createDto: CreateRedemptionDto): Promise<Redemption> {
    const { userId, eventId, rewardId } = createDto;

    // 중복 요청 방지 (이미 SUCCESS인 경우)
    const existing = await this.redemptionModel
      .findOne({ userId, eventId, rewardId, status: 'SUCCESS' })
      .exec();
    if (existing) {
      throw new BadRequestException(`이미 보상을 성공적으로 요청하셨습니다.`);
    }

    // 이벤트 유효성 검사
    const event = await this.eventModel.findById(eventId).exec();
    if (!event || !event.active) {
      throw new BadRequestException(`유효하지 않거나 비활성화된 이벤트입니다.`);
    }

    // 이벤트 기간 검사. 필요시
    // const now = new Date();
    // if (now < event.startAt || now > event.endAt) {
    //   throw new BadRequestException(`이벤트 기간이 아닙니다.`);
    // }

    // 보상 검증
    const reward = await this.rewardModel.findById(rewardId).exec();
    if (!reward || reward.eventId !== eventId) {
      throw new BadRequestException(`해당 이벤트에 연결된 보상이 아닙니다.`);
    }

    // 조건 검증
    let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let reason: string | undefined;

    for (const cond of event.conditions) {
      let achieved = 0;
      if (cond.type === 'login') {
        achieved = await this.userStatsService.getLoginDays(userId);
      } else if (cond.type === 'invite') {
        achieved = await this.userStatsService.getInviteCount(userId);
      }

      if (achieved < cond.count) {
        status = 'FAILED';
        reason = `조건 미충족: ${cond.type} ${cond.count}회 필요`;
        break;
      }
    }

    // 요청 저장
    const created = new this.redemptionModel({
      ...createDto,
      status,
      ...(reason ? { reason } : {}),
    });
    return (await created.save()).toObject();
  }

  /** 전체 요청 조회 (필터: userId, eventId, status) */
  async findAll(
    userId?: string, 
    eventId?: string,
    status?: 'SUCCESS' | 'FAILED',
  ): Promise<Redemption[]> {
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;
    return this.redemptionModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /** 단일 요청 조회 */
  async findOne(id: string): Promise<Redemption> {
    const redemption = await this.redemptionModel.findById(id).exec();
    if (!redemption) {
      throw new NotFoundException(`Redemption ${id} not found`);
    }
    return redemption.toObject();
  }
}
