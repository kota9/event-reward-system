import { Module, Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class ProxyController {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  @All('*')
  async proxy(@Req() req, @Res() res) {
    const authBase = this.config.get('AUTH_SERVICE_URL');
    const eventBase = this.config.get('EVENT_SERVICE_URL');
    let target: string;

    // URL 맵핑: /auth→auth-service, /events→event-service
    if (req.url.startsWith('/auth')) {
      target = `${authBase}${req.url}`;
    } else if (
      req.url.startsWith('/events') || 
      req.url.startsWith('/rewards') || req.url.startsWith('/redemptions')
    ) {
      target = `${eventBase}${req.url}`;
    } else {
      return res.status(404).send('Not Found');
    }

    try {
      const axios = this.http.axiosRef;
      const response = await axios.request({
        method: req.method,
        url: target,
        headers: {
          'Content-Type': 'application/json',
          Authorization: req.headers.authorization,
        },
        data: JSON.stringify(req.body), // ← 여기서 JSON.stringfy
      });
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      const status = err.response?.status || 500;
      return res.status(status).json({ message: err.message });
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '3600s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ProxyController],
  providers: [AuthGuard, RolesGuard],
})
export class ProxyModule {}
