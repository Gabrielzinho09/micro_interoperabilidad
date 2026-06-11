import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './controllers/health.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    // Terminus ejecuta checks de salud; HttpModule permite probar el endpoint
    // Swagger y TypeOrmHealthIndicator valida la conexion de base de datos.
    TerminusModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [],
  controllers: [HealthController],
})
export class HealthModule {}
