import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  /** 1) 이벤트 생성 */
  async create(createDto: CreateEventDto): Promise<Event> {
    const created = new this.eventModel({
      ...createDto,
      // conditions: [{ type, count }, ...]
      conditions: createDto.conditions.map(c => ({
        type: c.type,
        count: c.count,
      })),
    });
    return (await created.save()).toObject();
  }

  /** 2) 전체 이벤트 조회 */
  async findAll(): Promise<Event[]> {
    return this.eventModel.find().sort({ startAt: -1 }).exec();
  }

  /** 3) ID로 단일 이벤트 조회 */
  async findOne(id: string): Promise<Event> {
    const ev = await this.eventModel.findById(id).exec();
    if (!ev) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return ev.toObject();
  }
}
