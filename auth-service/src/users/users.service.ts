import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // 새 유저 생성
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const created = new this.userModel(createUserDto);
      return await created.save();
    } catch (e: any) {
      // Mongo duplicate key error
      if (e.code === 11000) {
        throw new HttpException('이메일이 이미 존재합니다.', HttpStatus.CONFLICT);
      }
      throw new HttpException('유저 생성 중 오류', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 모든 유저 조회
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // 특정 유저 조회
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new HttpException('유저를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  // 유저 정보 및 역할 업데이트
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updated) {
      throw new HttpException('유저를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  // 유저 삭제
  async remove(id: string): Promise<void> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new HttpException('유저를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
  }
  
}
