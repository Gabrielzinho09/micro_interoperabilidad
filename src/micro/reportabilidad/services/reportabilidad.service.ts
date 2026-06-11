import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReportabilidadKpisResponseDto } from '../dto/reportabilidad-kpis-response.dto';

interface KpiResult {
  total_renagro: string;
  enriquecidos_afc: string;
  enriquecidos_infocampo: string;
  total_enriquecidos: string;
  solo_renagro: string;
  pct_enriquecidos: string | null;
}

@Injectable()
export class ReportabilidadService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getKpis(): Promise<ReportabilidadKpisResponseDto> {
    // Agrega KPIs directamente desde la vista final de productores.
    // No modifica datos; solo calcula totales del universo RENAGRO y cruces.
    const rows = await this.dataSource.query<KpiResult[]>(`
      SELECT
        COUNT(*) FILTER (WHERE registrado_en_renagro = true) AS total_renagro,
        COUNT(*) FILTER (WHERE registrado_en_renagro AND registrado_en_afc) AS enriquecidos_afc,
        COUNT(*) FILTER (WHERE registrado_en_renagro AND registrado_en_infocampo) AS enriquecidos_infocampo,
        COUNT(*) FILTER (WHERE registrado_en_renagro AND (registrado_en_afc OR registrado_en_infocampo)) AS total_enriquecidos,
        COUNT(*) FILTER (WHERE registrado_en_renagro AND NOT registrado_en_afc AND NOT registrado_en_infocampo) AS solo_renagro,
        ROUND(
          COUNT(*) FILTER (WHERE registrado_en_renagro AND (registrado_en_afc OR registrado_en_infocampo))
          * 100.0 / NULLIF(COUNT(*) FILTER (WHERE registrado_en_renagro), 0),
          2
        ) AS pct_enriquecidos
      FROM sc_interop_renagro_magp.vw_tablero_interop_productores
    `);
    const totals = rows[0] ?? {
      total_renagro: '0',
      enriquecidos_afc: '0',
      enriquecidos_infocampo: '0',
      total_enriquecidos: '0',
      solo_renagro: '0',
      pct_enriquecidos: '0',
    };

    return {
      totales: totals,
      distribuciones: {},
    };
  }
}
