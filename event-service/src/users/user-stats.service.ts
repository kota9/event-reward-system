import { Injectable } from '@nestjs/common';

@Injectable()
export class UserStatsService {
  // 사용자 로그인 일수 조회 (예시: 실제 로직으로 대체)
  async getLoginDays(userId: string): Promise<number> {
    // TODO: 실제 데이터베이스 또는 외부 서비스 연동
    // 테스트 코드
    const loginDays = 10;
    return loginDays;
  }

  // 친구 초대 수 조회 (예시)
  async getInviteCount(userId: string): Promise<number> {
    // TODO: 실제 로직 구현
    // 테스트 코드
    const inviteCount = 5;
    return inviteCount;
  }
}