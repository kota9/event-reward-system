import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "../users/user.schema";
import { SignUpDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입: 비밀번호 해시, 기본 ROLE 지정
  async signup(signupDto: SignUpDto): Promise<User> {
    const { email, password, roles } = signupDto;
    const existion = await this.userModel.findOne({ email }).exec();
    if (existion) {
      throw new ConflictException("이미 존재하는 이메일입니다.");
    }
    const hash = await bcrypt.hash(password, 10);
    const created = new this.userModel({
      email,
      password: hash,
      roles: roles ? roles : "USER", // 기본 ROLE 지정
    });
    return created.save();
  }

  // 로그인: 인증 후 JWT 발급
  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException("이메일 또는 비밀번호가 잘못되었습니다.");
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException("이메일 또는 비밀번호가 잘못되었습니다.");
    }
    const payload = { sub: user._id.toString(), roles: user.roles };
    return this.jwtService.sign(payload);
  }

}
