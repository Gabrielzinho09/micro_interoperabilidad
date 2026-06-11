import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BitacoraInteropEjecucion } from '../entities/bitacora-interop-ejecucion.entity';
import { VwDashboardProductores } from '../entities/vw-dashboard-productores.entity';
import { VwTableroBrechas } from '../entities/vw-tablero-brechas.entity';
import { VwTableroConflictos } from '../entities/vw-tablero-conflictos.entity';
import { VwTableroResumenFuentes } from '../entities/vw-tablero-resumen-fuentes.entity';

export interface DistributionRow {
  valor: string | number | null;
  total: string;
  etiqueta?: string;
}

export interface FuenteShare {
  fuente: string;
  total: number;
  porcentaje: number;
  color: string;
  descripcion: string;
}

export interface CombinacionFuente {
  etiqueta: string;
  total: number;
  fuentes: string[];
}

export interface EstadoDistribucion {
  estado: string;
  total: number;
  porcentaje: number;
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export interface EtlJob {
  id: string;
  nombre: string;
  ambiente: string | null;
  ultimaEjecucion: Date | null;
  fechaInicio: Date | null;
  estado: 'success' | 'warning' | 'error' | 'running' | 'neutral';
  estadoRaw: string | null;
  totalRegistros: number;
  homologados: number;
  pendientes: number;
  rechazados: number;
  duracionMs: number;
  observacion: string | null;
}

export interface DashboardMapQuery {
  indicadorId?: string;
  periodo?: string;
}

interface TerritorialProvinceRow {
  codigo_provincia: string | null;
  nombre_provincia: string | null;
  total_registros_territoriales: string | number | null;
  total_productores: string | number | null;
  total_renagro: string | number | null;
  total_infocampo: string | number | null;
  total_afc: string | number | null;
  total_productores_multiprovincia: string | number | null;
}

interface TerritorialMetric {
  codigoProvincia: string;
  nombre: string;
  valor: number;
  total: number;
  porcentaje: number;
  estado: string;
  fuentes: string[];
}

interface MapIndicatorDefinition {
  id: string;
  nombre: string;
  unidad: string;
  valueColumn: keyof Pick<
    TerritorialProvinceRow,
    | 'total_registros_territoriales'
    | 'total_productores'
    | 'total_renagro'
    | 'total_infocampo'
    | 'total_afc'
    | 'total_productores_multiprovincia'
  >;
}

/**
 * Servicio del dashboard ejecutivo.
 *
 * Regla rectora: todas las metricas y distribuciones se calculan sobre el universo
 * RENAGRO (vw_dashboard_productores, 291k filas). No se exponen contadores de
 * productores SOLO_INFOCAMPO o SOLO_AFC en los KPIs principales.
 *
 * Las brechas y conflictos se exponen aparte como "calidad del cruce", claramente
 * etiquetados.
 */
@Injectable()
export class DashboardService {
  private readonly defaultMapIndicatorId = 'IND-PROD-001';

  private readonly mapIndicators: Record<string, MapIndicatorDefinition> = {
    'IND-PROD-001': {
      id: 'IND-PROD-001',
      nombre: 'Total de productores interoperados',
      unidad: 'productores',
      valueColumn: 'total_productores',
    },
  };

  private readonly sourceColors: Record<string, string> = {
    RENAGRO: '#006b5b',
    INFOCAMPO: '#1e5c94',
    AFC: '#695094',
  };

  private readonly sourceDescriptions: Record<string, string> = {
    RENAGRO: 'Fuente rectora del modelo de interoperabilidad',
    INFOCAMPO: 'Cruce con base agroproductiva',
    AFC: 'Cruce con registro de Agricultura Familiar Campesina',
  };

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(VwDashboardProductores)
    private readonly productoresRepo: Repository<VwDashboardProductores>,
    @InjectRepository(VwTableroResumenFuentes)
    private readonly fuentesRepo: Repository<VwTableroResumenFuentes>,
    @InjectRepository(VwTableroBrechas)
    private readonly brechasRepo: Repository<VwTableroBrechas>,
    @InjectRepository(VwTableroConflictos)
    private readonly conflictosRepo: Repository<VwTableroConflictos>,
    @InjectRepository(BitacoraInteropEjecucion)
    private readonly bitacoraRepo: Repository<BitacoraInteropEjecucion>,
  ) {}

  async getKpis() {
    // Resumen ejecutivo: cruza resumen de fuentes, ultima ejecucion ETL,
    // brechas/conflictos y distribuciones sobre el universo RENAGRO.
    const [fuentesRows, etl, brechas, conflictos] = await Promise.all([
      this.fuentesRepo.find(),
      this.getUltimaEjecucionEtl(),
      this.brechasRepo.find(),
      this.conflictosRepo.find(),
    ]);

    const fuentesMap = new Map<string, number>(
      fuentesRows.map((r) => [r.metrica, Number(r.total)]),
    );

    const [
      porTotalFuentes,
      porEstadoInteroperabilidad,
      porFuentesPresentes,
      porEstadoHomologacion,
    ] = await Promise.all([
      this.countBy('numero_fuentes'),
      this.countBy('estado_interoperabilidad'),
      this.countBy('fuentes_presentes'),
      this.countBy('estado_homologacion'),
    ]);

    const totalRenagro = fuentesMap.get('total_renagro') ?? 0;
    const productoresDosFuentes =
      fuentesMap.get('productores_dos_fuentes') ?? 0;
    const productoresTresFuentes =
      fuentesMap.get('productores_tres_fuentes') ?? 0;
    const productoresUnaFuente = fuentesMap.get('productores_una_fuente') ?? 0;

    return {
      periodo: this.derivePeriodo(etl?.fecha_fin),
      generadoEn: etl?.fecha_fin ?? null,
      totales: {
        total_productores: totalRenagro,
        productores_renagro: totalRenagro,
        productores_infocampo: fuentesMap.get('total_infocampo') ?? 0,
        productores_afc: fuentesMap.get('total_afc') ?? 0,
        productores_multifuente: productoresDosFuentes + productoresTresFuentes,
        productores_solo_renagro: Math.max(
          0,
          totalRenagro - productoresDosFuentes - productoresTresFuentes,
        ),
        productores_una_fuente_global: productoresUnaFuente,
        registros_procesados: Number(etl?.registros_procesados ?? 0),
        registros_validos: Number(etl?.registros_hom ?? 0),
        registros_pendientes: Number(etl?.registros_pend ?? 0),
        registros_rechazados: Number(etl?.registros_rej ?? 0),
        nombre_job_ultimo: etl?.nombre_job ?? null,
        estado_ejecucion_ultimo: etl?.estado_ejecucion ?? null,
        ultima_generacion: etl?.fecha_fin ?? null,
      },
      distribuciones: {
        por_total_fuentes: porTotalFuentes,
        por_estado_interoperabilidad_productor: porEstadoInteroperabilidad,
        por_fuentes_presentes: porFuentesPresentes,
        por_estado_homologacion: porEstadoHomologacion,
        por_tipo_brecha: brechas.map((b) => ({
          valor: b.tipo_brecha,
          total: b.total,
        })) as DistributionRow[],
        por_tipo_conflicto: conflictos.map((c) => ({
          valor: c.tipo_conflicto,
          total: c.total,
          etiqueta: `${c.modulo} · ${c.campo_negocio}`,
        })) as DistributionRow[],
      },
    };
  }

  async getFuentes() {
    // Universo RENAGRO con presencia en cada fuente (regla rectora).
    // Tambien expone universos paralelos como referencia para "brechas".
    const productoresQB = this.productoresRepo.createQueryBuilder('p');

    const [
      universoRenagro,
      productoresConRenagro,
      productoresConInfocampo,
      productoresConAfc,
      fuentesGlobales,
      combinacionesRaw,
      etl,
    ] = await Promise.all([
      productoresQB.clone().getCount(),
      this.productoresRepo
        .createQueryBuilder('p')
        .where('p.registrado_en_renagro = TRUE')
        .getCount(),
      this.productoresRepo
        .createQueryBuilder('p')
        .where('p.registrado_en_infocampo = TRUE')
        .getCount(),
      this.productoresRepo
        .createQueryBuilder('p')
        .where('p.registrado_en_afc = TRUE')
        .getCount(),
      this.fuentesRepo.find(),
      this.countBy('fuentes_presentes'),
      this.getUltimaEjecucionEtl(),
    ]);

    const fuentesMap = new Map<string, number>(
      fuentesGlobales.map((r) => [r.metrica, Number(r.total)]),
    );

    const fuentes: FuenteShare[] = [
      {
        fuente: 'RENAGRO',
        total: productoresConRenagro,
        porcentaje: this.pct(productoresConRenagro, universoRenagro),
        color: this.sourceColors['RENAGRO'],
        descripcion: this.sourceDescriptions['RENAGRO'],
      },
      {
        fuente: 'INFOCAMPO',
        total: productoresConInfocampo,
        porcentaje: this.pct(productoresConInfocampo, universoRenagro),
        color: this.sourceColors['INFOCAMPO'],
        descripcion: this.sourceDescriptions['INFOCAMPO'],
      },
      {
        fuente: 'AFC',
        total: productoresConAfc,
        porcentaje: this.pct(productoresConAfc, universoRenagro),
        color: this.sourceColors['AFC'],
        descripcion: this.sourceDescriptions['AFC'],
      },
    ];

    const combinaciones: CombinacionFuente[] = combinacionesRaw.map((row) => {
      const etiqueta = String(row.valor ?? 'Sin clasificar');
      const fuentesArr = etiqueta
        .split('/')
        .map((p) => p.trim())
        .filter(Boolean);
      return {
        etiqueta,
        total: Number(row.total),
        fuentes: fuentesArr,
      };
    });

    return {
      periodo: this.derivePeriodo(etl?.fecha_fin),
      generadoEn: etl?.fecha_fin ?? null,
      totalProductores: universoRenagro,
      fuentes,
      combinaciones,
      universosParalelos: {
        // Total de productores conocidos en cada fuente (incluye brechas no-RENAGRO).
        // Se exponen como referencia para "candidatos a integrar a RENAGRO".
        infocampo_global: fuentesMap.get('total_infocampo') ?? 0,
        afc_global: fuentesMap.get('total_afc') ?? 0,
      },
    };
  }

  async getEstados() {
    // Estados mezcla dos planos: estado funcional del productor interoperado
    // y calidad tecnica de ejecucion ETL (HOM/PEND/REJ).
    const [
      porEstadoHomologacion,
      porTipoBrecha,
      porEstadoInteroperabilidad,
      etl,
    ] = await Promise.all([
      this.countBy('estado_homologacion'),
      this.brechasRepo.find(),
      this.countBy('estado_interoperabilidad'),
      this.getUltimaEjecucionEtl(),
    ]);

    const totalHom = Number(etl?.registros_hom ?? 0);
    const totalPend = Number(etl?.registros_pend ?? 0);
    const totalRej = Number(etl?.registros_rej ?? 0);
    const totalProc = Number(etl?.registros_procesados ?? 0);

    const estadosCalidad: EstadoDistribucion[] = [
      {
        estado: 'HOMOLOGADO',
        total: totalHom,
        porcentaje: this.pct(totalHom, totalProc),
        tone: 'success',
      },
      {
        estado: 'PENDIENTE',
        total: totalPend,
        porcentaje: this.pct(totalPend, totalProc),
        tone: 'warning',
      },
      {
        estado: 'RECHAZADO',
        total: totalRej,
        porcentaje: this.pct(totalRej, totalProc),
        tone: 'danger',
      },
    ];

    const estadosHomologacion: EstadoDistribucion[] = porEstadoHomologacion.map(
      (row) => ({
        estado: String(row.valor ?? 'Sin clasificar'),
        total: Number(row.total),
        porcentaje: this.pct(
          Number(row.total),
          porEstadoHomologacion.reduce((a, r) => a + Number(r.total), 0),
        ),
        tone: this.toneFromText(String(row.valor ?? '')),
      }),
    );

    const estadosValidacion: EstadoDistribucion[] = porTipoBrecha
      .filter((b) => b.tipo_brecha !== 'SOLO_RENAGRO')
      .map((b) => ({
        estado: b.tipo_brecha,
        total: Number(b.total),
        porcentaje: 0,
        tone: 'info' as const,
      }));

    const estadosInteroperabilidad: EstadoDistribucion[] =
      porEstadoInteroperabilidad.map((row) => ({
        estado: String(row.valor ?? ''),
        total: Number(row.total),
        porcentaje: this.pct(
          Number(row.total),
          porEstadoInteroperabilidad.reduce((a, r) => a + Number(r.total), 0),
        ),
        tone: 'info' as const,
      }));

    return {
      periodo: this.derivePeriodo(etl?.fecha_fin),
      generadoEn: etl?.fecha_fin ?? null,
      estadosHomologacion,
      estadosCalidad,
      estadosValidacion,
      estadosInteroperabilidad,
    };
  }

  async getEtlJobs() {
    // Lee la bitacora Pentaho y la adapta al contrato visual del dashboard.
    const ejecuciones = await this.bitacoraRepo
      .createQueryBuilder('b')
      .orderBy('b.fecha_fin', 'DESC', 'NULLS LAST')
      .addOrderBy('b.fecha_inicio', 'DESC', 'NULLS LAST')
      .limit(20)
      .getMany();

    const jobs: EtlJob[] = ejecuciones.map((row) => {
      const inicio = row.fecha_inicio ? new Date(row.fecha_inicio) : null;
      const fin = row.fecha_fin ? new Date(row.fecha_fin) : null;
      const duracionMs =
        inicio && fin ? Math.max(0, fin.getTime() - inicio.getTime()) : 0;
      return {
        id: String(row.id_ejecucion),
        nombre: row.nombre_job ?? 'job-sin-nombre',
        ambiente: row.ambiente ?? null,
        ultimaEjecucion: fin,
        fechaInicio: inicio,
        estado: this.mapEtlEstado(row.estado_ejecucion ?? ''),
        estadoRaw: row.estado_ejecucion ?? null,
        totalRegistros: Number(row.registros_procesados ?? 0),
        homologados: Number(row.registros_hom ?? 0),
        pendientes: Number(row.registros_pend ?? 0),
        rechazados: Number(row.registros_rej ?? 0),
        duracionMs,
        observacion: row.observacion ?? null,
      };
    });

    return {
      generadoEn: new Date().toISOString(),
      total: jobs.length,
      jobs,
    };
  }

  async getMapaProvincias(query: DashboardMapQuery = {}) {
    // Devuelve metricas provinciales ya agregadas para que el frontend solo
    // tenga que pintar el mapa y no calcular indicadores territoriales.
    const requestedIndicatorId =
      query.indicadorId?.trim() || this.defaultMapIndicatorId;
    const indicator =
      this.mapIndicators[requestedIndicatorId] ??
      this.mapIndicators[this.defaultMapIndicatorId];

    const [rows, etl] = await Promise.all([
      this.dataSource.query<TerritorialProvinceRow[]>(`
        SELECT
          provincia_codigo AS codigo_provincia,
          provincia_nombre AS nombre_provincia,
          total_registros_territoriales,
          total_productores,
          total_renagro,
          total_infocampo,
          total_afc,
          total_productores_multiprovincia
        FROM sc_interop_renagro_magp.vw_dashboard_territorial_provincias
        WHERE provincia_codigo IS NOT NULL
        ORDER BY provincia_codigo
      `),
      this.getUltimaEjecucionEtl(),
    ]);

    const rawMetrics = rows.map((row) =>
      this.mapTerritorialProvince(row, indicator),
    );
    const totalValor = rawMetrics.reduce(
      (acc, metric) => acc + metric.valor,
      0,
    );
    const datos = rawMetrics.map((metric) => ({
      ...metric,
      porcentaje: this.pct(metric.valor, totalValor),
    }));
    const valores = datos.map((metric) => metric.valor);

    return {
      indicadorId: indicator.id,
      nombreIndicador: indicator.nombre,
      nivel: 'provincia',
      periodo: query.periodo?.trim() || this.derivePeriodo(etl?.fecha_fin),
      unidad: indicator.unidad,
      minValor: valores.length ? Math.min(...valores) : 0,
      maxValor: valores.length ? Math.max(...valores) : 0,
      filtroProvincia: null,
      filtroCanton: null,
      datos,
    };
  }

  // ---------------- helpers ----------------

  private async getUltimaEjecucionEtl() {
    return this.bitacoraRepo
      .createQueryBuilder('b')
      .orderBy('b.fecha_fin', 'DESC', 'NULLS LAST')
      .limit(1)
      .getOne();
  }

  private async countBy(
    field: keyof VwDashboardProductores,
  ): Promise<DistributionRow[]> {
    const alias = 'p';
    const rows = await this.productoresRepo
      .createQueryBuilder(alias)
      .select(`${alias}.${field as string}`, 'valor')
      .addSelect('COUNT(*)', 'total')
      .groupBy(`${alias}.${field as string}`)
      .orderBy('total', 'DESC')
      .getRawMany<DistributionRow>();
    return rows;
  }

  private derivePeriodo(fecha?: Date | null): string {
    if (!fecha) return 'sin-periodo';
    const d = new Date(fecha);
    const year = d.getFullYear();
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `${year}-Q${q}`;
  }

  private pct(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 10000) / 100;
  }

  private toneFromText(
    value: string,
  ): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    const v = value.toUpperCase();
    if (v.includes('VALID') || v.includes('EXITO') || v.includes('FINALIZADO'))
      return 'success';
    if (v.includes('PEND') || v.includes('REV')) return 'warning';
    if (v.includes('RECHAZ') || v.includes('ERROR') || v.includes('FALL'))
      return 'danger';
    return 'info';
  }

  private mapTerritorialProvince(
    row: TerritorialProvinceRow,
    indicator: MapIndicatorDefinition,
  ): TerritorialMetric {
    const renagro = this.num(row.total_renagro);
    const infocampo = this.num(row.total_infocampo);
    const afc = this.num(row.total_afc);
    const fuentes = [
      renagro > 0 ? 'RENAGRO' : '',
      infocampo > 0 ? 'INFOCAMPO' : '',
      afc > 0 ? 'AFC' : '',
    ].filter(Boolean);

    return {
      codigoProvincia: this.normalizeProvinceCode(row.codigo_provincia),
      nombre: row.nombre_provincia?.trim() || 'SIN PROVINCIA',
      valor: this.num(row[indicator.valueColumn]),
      total: this.num(row.total_registros_territoriales),
      porcentaje: 0,
      estado:
        fuentes.length > 1 ? fuentes.join('_') : fuentes[0] || 'SIN_FUENTE',
      fuentes,
    };
  }

  private normalizeProvinceCode(value: string | null): string {
    const code = String(value ?? '').trim();
    return code.length === 1 ? `0${code}` : code;
  }

  private num(value: string | number | null | undefined): number {
    return Number(value ?? 0);
  }

  private mapEtlEstado(
    raw: string,
  ): 'success' | 'warning' | 'error' | 'running' | 'neutral' {
    const v = raw.toUpperCase();
    if (v.includes('FINALIZADO') || v.includes('SUCCESS') || v.includes('OK'))
      return 'success';
    if (v.includes('PEND') || v.includes('WARN') || v.includes('REV'))
      return 'warning';
    if (v.includes('ERROR') || v.includes('FAIL') || v.includes('FALL'))
      return 'error';
    if (v.includes('RUN') || v.includes('PROC')) return 'running';
    return 'neutral';
  }

  async getEnriquecimiento() {
    // KPI de robustecimiento: mide productores RENAGRO con datos aportados por
    // fuentes complementarias y campos potencialmente actualizables.
    const [kpiRows, robRows, modulosRows, tipoRows] = await Promise.all([
      // KPI base sobre el universo RENAGRO (cruce con otras fuentes)
      this.dataSource.query<
        Array<{
          total_renagro: string;
          enriquecidos_afc: string;
          enriquecidos_infocampo: string;
          total_enriquecidos: string;
          solo_renagro: string;
          pct_enriquecidos: string | null;
          total_sin_renagro: string;
        }>
      >(`
        SELECT
          COUNT(*) FILTER (WHERE registrado_en_renagro = true)::int         AS total_renagro,
          COUNT(*) FILTER (WHERE registrado_en_renagro AND registrado_en_afc)::int
                                                                             AS enriquecidos_afc,
          COUNT(*) FILTER (WHERE registrado_en_renagro AND registrado_en_infocampo)::int
                                                                             AS enriquecidos_infocampo,
          COUNT(*) FILTER (WHERE registrado_en_renagro
            AND (registrado_en_afc OR registrado_en_infocampo))::int         AS total_enriquecidos,
          COUNT(*) FILTER (WHERE registrado_en_renagro
            AND NOT registrado_en_afc AND NOT registrado_en_infocampo)::int  AS solo_renagro,
          ROUND(
            COUNT(*) FILTER (WHERE registrado_en_renagro
              AND (registrado_en_afc OR registrado_en_infocampo)) * 100.0
            / NULLIF(COUNT(*) FILTER (WHERE registrado_en_renagro = true), 0),
            2
          )                                                                  AS pct_enriquecidos,
          COUNT(*) FILTER (WHERE NOT registrado_en_renagro)::int            AS total_sin_renagro
        FROM sc_interop_renagro_magp.vw_tablero_interop_productores
      `),
      // Robustecibles: productores RENAGRO con datos nuevos reales (distinct, sin doble conteo)
      this.dataSource.query<
        Array<{ total_robustecibles: string; total_campos: string }>
      >(`
        SELECT
          COUNT(*)::int                                  AS total_robustecibles,
          COALESCE(SUM(total_datos_actualizables), 0)::int AS total_campos
        FROM sc_interop_renagro_magp.vw_dashboard_productores_robustecibles
      `),
      // Potencial por modulo: distinct real desde la vista atomica
      this.dataSource.query<
        Array<{
          modulo: string;
          productores_afectados: string;
          total_campos: string;
        }>
      >(`
        SELECT
          CASE
            WHEN lower(modulo) IN ('contacto', 'productor_contacto') THEN 'contacto'
            ELSE lower(modulo)
          END                                       AS modulo,
          COUNT(DISTINCT per_identificacion)::int   AS productores_afectados,
          COUNT(*)::int                             AS total_campos
        FROM sc_interop_renagro_magp.vw_interop_datos_actualizables
        GROUP BY 1
        ORDER BY productores_afectados DESC
      `),
      // Desglose por tipo de actualizacion (nuevo / conflicto / complementario)
      this.dataSource.query<
        Array<{
          tipo_actualizacion: string;
          productores: string;
          campos: string;
        }>
      >(`
        SELECT
          tipo_actualizacion,
          COUNT(DISTINCT per_identificacion)::int AS productores,
          COUNT(*)::int                           AS campos
        FROM sc_interop_renagro_magp.vw_interop_datos_actualizables
        GROUP BY tipo_actualizacion
        ORDER BY campos DESC
      `),
    ]);

    const kpi = kpiRows[0] ?? {};
    const rob = robRows[0] ?? { total_robustecibles: '0', total_campos: '0' };

    return {
      totales: {
        total_renagro: Number(kpi['total_renagro'] ?? 0),
        enriquecidos_afc: Number(kpi['enriquecidos_afc'] ?? 0),
        enriquecidos_infocampo: Number(kpi['enriquecidos_infocampo'] ?? 0),
        total_enriquecidos: Number(kpi['total_enriquecidos'] ?? 0),
        solo_renagro: Number(kpi['solo_renagro'] ?? 0),
        pct_enriquecidos: Number(kpi['pct_enriquecidos'] ?? 0),
        total_sin_renagro: Number(kpi['total_sin_renagro'] ?? 0),
        total_robustecibles: Number(rob.total_robustecibles),
        total_campos_actualizables: Number(rob.total_campos),
        pct_robustecibles: this.pct(
          Number(rob.total_robustecibles),
          Number(kpi['total_renagro'] ?? 0),
        ),
      },
      potencial_modulos: modulosRows.map((row) => ({
        modulo: row.modulo,
        productores_afectados: Number(row.productores_afectados),
        total_campos: Number(row.total_campos),
      })),
      por_tipo_actualizacion: tipoRows.map((row) => ({
        tipo: row.tipo_actualizacion,
        productores: Number(row.productores),
        campos: Number(row.campos),
      })),
    };
  }
}
