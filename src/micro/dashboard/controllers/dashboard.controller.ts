import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { DashboardService } from '../services/dashboard.service';

/**
 * Controlador del dashboard ejecutivo.
 * Publica endpoints que el frontend consume como KPIs, fuentes, estados,
 * ejecuciones ETL, enriquecimiento y mapa territorial.
 */
@ApiTags('Micro Dashboard')
@ApiSecurity('X-API-KEY', ['X-API-KEY'])
@UseGuards(AuthGuard('api-key'))
@Controller('micro-template/v1/dashboard')
@UseFilters(new HttpExceptionFilter())
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  // Cada endpoint delega en DashboardService; aqui no se arma SQL.
  @Get('/kpis')
  @ApiOperation({
    summary: 'KPIs del cockpit ejecutivo (esquema sc_interop_renagro_magp)',
    description:
      'Lectura read-only sobre vistas sc_interop_renagro_magp. Universo RENAGRO (regla rectora). Las brechas y conflictos se exponen en distribuciones separadas.',
  })
  getKpis() {
    return this.dashboardService.getKpis();
  }

  @Get('/fuentes')
  @ApiOperation({
    summary: 'Distribucion por fuente institucional',
    description:
      'Totales por fuente (RENAGRO, INFOCAMPO, AFC) y combinaciones (Solo RENAGRO, RENAGRO+INFOCAMPO, etc.) calculadas sobre el universo RENAGRO.',
  })
  getFuentes() {
    return this.dashboardService.getFuentes();
  }

  @Get('/estados')
  @ApiOperation({
    summary: 'Estados de homologacion, calidad y validacion',
    description:
      'Distribuciones de estado del universo RENAGRO mas estados de calidad ETL y validacion de brechas.',
  })
  getEstados() {
    return this.dashboardService.getEstados();
  }

  @Get('/etl-jobs')
  @ApiOperation({
    summary: 'Historico de ejecuciones del ETL Pentaho',
    description:
      'Ultimos 20 jobs ejecutados (bitacora_interop_ejecucion) con metricas de procesados/homologados/pendientes/rechazados y duracion.',
  })
  getEtlJobs() {
    return this.dashboardService.getEtlJobs();
  }

  @Get('/enriquecimiento')
  @ApiOperation({
    summary: 'KPI central de enriquecimiento RENAGRO',
    description:
      'Cuantos productores RENAGRO tienen su perfil enriquecido con datos de AFC/INFOCAMPO, mas el potencial de campos actualizables por modulo (vw_interop_actualizable_modulos/contacto).',
  })
  getEnriquecimiento() {
    return this.dashboardService.getEnriquecimiento();
  }

  @Get('/mapa/provincias')
  @ApiOperation({
    summary: 'Metricas territoriales por provincia para mapa',
    description:
      'Lee sc_interop_renagro_magp.vw_dashboard_territorial_provincias y devuelve el contrato del tablero mapa provincial.',
  })
  getMapaProvincias(
    @Query() query: { indicadorId?: string; periodo?: string },
  ) {
    return this.dashboardService.getMapaProvincias(query);
  }
}
