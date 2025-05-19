import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Reward, RewardDocument } from './reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
  ) {}

  // 보상 등록
  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    const createdReward = new this.rewardModel({
      ...createRewardDto,
    });
    return (await createdReward.save()).toObject();
  }

  // 전체 보상 조회 (옵션: eventId로 필터링)
  async findAll(eventId?: string): Promise<Reward[]> {
    const filter = eventId ? { eventId } : {};
    return this.rewardModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  // 단일 보상 조회
  async findOne(id: string): Promise<Reward> {
    const reward = await this.rewardModel.findById(id).exec();
    if (!reward) {
      throw new NotFoundException(`Reward with id ${id} not found`);
    }
    return reward.toObject();
  }

}
