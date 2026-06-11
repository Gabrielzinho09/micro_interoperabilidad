import { Module } from '@nestjs/common';
import { ReportabilidadController } from './controllers/reportabilidad.controller';
import { ReportabilidadService } from './services/reportabilidad.service';

@Module({
  // Reportabilidad expone KPIs generales y delega la consulta al servicio.
  controllers: [ReportabilidadController],
  providers: [ReportabilidadService],
})
export class ReportabilidadModule {}
