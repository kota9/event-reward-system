import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RedemptionsService } from './redemptions.service';
import { CreateRedemptionDto } from './dto/create-redemption.dto';

@Controller('redemptions')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  /** 보상 요청 등록 */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() dto: CreateRedemptionDto) {
    // 요청자는 자신의 userId로만 요청 가능
    const userId = req.user.userId;
    const redemption = await this.redemptionsService.create({
      userId,
      eventId: dto.eventId,
      rewardId: dto.rewardId,
    });
    return { message: 'Redemption requested', redemption };
  }

  /**
   * 보상 요청 내역 조회
   * - USER: 자신의 요청만 조회
   * - ADMIN, AUDITOR: 전체 조회 혹은 특정 userId 조회
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Req() req: any,
    @Query('userId') queryUserId?: string,
    @Query('eventId') eventId?: string,
    @Query('status') status?: 'SUCCESS' | 'FAILED',
  ) {
    const roles: string = req.user.roles;
    const requestUserId: string = req.user.userId;

    let userIdFilter: string | undefined;

    if (queryUserId) {
      // 특정 userId 쿼리는 ADMIN/AUDITOR만 허용
      if (!roles.includes('ADMIN') && !roles.includes('AUDITOR')) {
        throw new ForbiddenException('권한이 없습니다.');
      }
      userIdFilter = queryUserId;
    } else {
      if (roles.includes('ADMIN') || roles.includes('AUDITOR')) {
        // 관리자/감사자는 전체 조회
        userIdFilter = undefined;
      } else {
        // 일반 유저는 자신의 기록만
        userIdFilter = requestUserId;
      }
    }

    const redemptions = await this.redemptionsService.findAll(
      userIdFilter,
      eventId,
      status,
    );
    return { redemptions };
  }

  /**
   * 단일 요청 조회
   * - OWNER, ADMIN, AUDITOR 허용
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Req() req: any, @Param('id') id: string) {
    const redemption = await this.redemptionsService.findOne(id);
    const roles: string[] = req.user.roles;
    const requesterId: string = req.user.userId;

    if (
      redemption.userId !== requesterId &&
      !roles.includes('ADMIN') &&
      !roles.includes('AUDITOR')
    ) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return { redemption };
  }
}
