import { Controller, Get, UseGuards, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@ApiTags('Micro Status')
@ApiSecurity('X-API-KEY', ['X-API-KEY'])
@Controller('micro/health')
@UseFilters(new HttpExceptionFilter())
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private readonly configService: ConfigService,
  ) {}
  @ApiOperation({
    summary: 'Estado de conexión del servicio',
    description: 'No modificar este servicio',
  })
  @Get('/status')
  @UseGuards(AuthGuard('api-key'))
  @HealthCheck()
  check() {
    // Verifica que la documentacion Swagger responda y que PostgreSQL acepte ping.
    // Tambien esta protegido con X-API-KEY como el resto del microservicio.
    const nameProyect: string =
      this.configService.get<string>('NAME_PROYECT') || '';
    const hostSwagger: string =
      this.configService.get<string>('HOST_SWAGGER') || '';
    return this.health.check([
      () => this.http.pingCheck(nameProyect, hostSwagger + '/' + nameProyect),
      () => this.db.pingCheck('database'),
    ]);
  }
}
