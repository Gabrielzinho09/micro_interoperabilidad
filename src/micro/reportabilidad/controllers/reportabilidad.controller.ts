import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { ReportabilidadKpisResponseDto } from '../dto/reportabilidad-kpis-response.dto';
import { ReportabilidadService } from '../services/reportabilidad.service';

/**
 * Controlador de KPIs generales.
 * Recibe la peticion HTTP y delega el calculo al servicio.
 */
@ApiTags('Micro Reportabilidad')
@ApiSecurity('X-API-KEY', ['X-API-KEY'])
@UseGuards(AuthGuard('api-key'))
@Controller('micro-template/v1/reportabilidad')
@UseFilters(new HttpExceptionFilter())
export class ReportabilidadController {
  constructor(private reportabilidadService: ReportabilidadService) {}

  // Endpoint read-only para resumen ejecutivo de interoperabilidad.
  @Get('/kpis')
  @ApiOperation({
    summary: 'Obtener KPIs generales de interoperabilidad',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.vw_tablero_interop_productores (solo productores con registrado_en_renagro = true).',
  })
  @ApiOkResponse({
    description: 'KPIs de interoperabilidad',
    type: ReportabilidadKpisResponseDto,
  })
  getKpis(): Promise<ReportabilidadKpisResponseDto> {
    return this.reportabilidadService.getKpis();
  }
}
