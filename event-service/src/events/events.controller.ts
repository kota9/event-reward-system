import { 
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * 이벤트 생성은 OPERATOR, ADMIN 권한만 가능
   */
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: CreateEventDto) {
    const ev = await this.eventsService.create(dto);
    return { message: 'Event created', event: ev };
  }

  /** 전체 이벤트 조회 */
  @Get()
  async findAll() {
    const events = await this.eventsService.findAll();
    return { events };
  }

  /** ID로 단일 이벤트 조회 */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ev = await this.eventsService.findOne(id);
    return { event: ev };
  }

}
