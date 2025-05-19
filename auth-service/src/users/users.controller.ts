import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 사용자 생성
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (e) {
      // 중복 이메일 등 처리
      if (e.status && e.status === HttpStatus.CONFLICT) {
        throw e;
      }
      throw new HttpException('유저 생성 중 오류', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 전체 사용자 조회
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // 단일 사용자 조회
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 사용자 정보 및 역할 업데이트
  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // 사용자 삭제
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: '유저 삭제 완료' };
  }
}
