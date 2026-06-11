import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { FichaAgricolaProductorDto } from '../dto/ficha-agricola-productor.dto';
import { FichaPecuariaProductorDto } from '../dto/ficha-pecuaria-productor.dto';
import { FichaProductorIntegradaDto } from '../dto/ficha-productor-integrada.dto';
import { ConsultaProductoresRenagro } from '../entities/consulta-productores-renagro.entity';
import { FichaProductorContacto } from '../entities/ficha-productor-contacto.entity';
import { FichaProductorExtensionAgropecuaria } from '../entities/ficha-productor-extension-agropecuaria.entity';
import { FichaProductorIdentificacion } from '../entities/ficha-productor-identificacion.entity';
import { FichaProductorPecuario } from '../entities/ficha-productor-pecuario.entity';
import { InteroperabilidadProductorComplementarias } from '../entities/interoperabilidad-productor-complementarias.entity';
import { InteropProductorCultivo } from '../entities/interop-productor-cultivo.entity';
import { InteropProductorResumenIntegral } from '../../reportabilidad/entities/interop-productor-resumen-integral.entity';
import { ResumenAgricolaProductor } from '../entities/resumen-agricola-productor.entity';
import { ResumenPecuarioProductor } from '../entities/resumen-pecuario-productor.entity';

/**
 * Servicio principal de productores.
 *
 * Responsabilidad: validar entradas, consultar vistas/tablas read-only con
 * TypeORM o SQL parametrizado, y componer respuestas para los controladores.
 * Aqui vive la regla funcional de RENAGRO como universo por defecto.
 */
@Injectable()
export class ProductorService {
  private readonly defaultFindAllLimit = 100;
  private readonly maxFindAllLimit = 1000;

  constructor(
    // DataSource se usa cuando la consulta requiere SQL agregado/dinamico.
    @InjectDataSource()
    private dataSource: DataSource,
    // Repositorios tipados para vistas con forma estable.
    @InjectRepository(FichaProductorIdentificacion)
    private fichaIdentificacionRepository: Repository<FichaProductorIdentificacion>,
    @InjectRepository(FichaProductorContacto)
    private contactoRepository: Repository<FichaProductorContacto>,
    @InjectRepository(ResumenAgricolaProductor)
    private resumenAgricolaRepository: Repository<ResumenAgricolaProductor>,
    @InjectRepository(InteropProductorCultivo)
    private cultivoRepository: Repository<InteropProductorCultivo>,
    @InjectRepository(ResumenPecuarioProductor)
    private resumenPecuarioRepository: Repository<ResumenPecuarioProductor>,
    @InjectRepository(FichaProductorPecuario)
    private fichaPecuarioRepository: Repository<FichaProductorPecuario>,
    @InjectRepository(FichaProductorExtensionAgropecuaria)
    private fichaExtensionRepository: Repository<FichaProductorExtensionAgropecuaria>,
    @InjectRepository(InteroperabilidadProductorComplementarias)
    private complementariasRepository: Repository<InteroperabilidadProductorComplementarias>,
    @InjectRepository(InteropProductorResumenIntegral)
    private resumenIntegralRepository: Repository<InteropProductorResumenIntegral>,
  ) {}

  async findAll(limit?: string): Promise<ConsultaProductoresRenagro[]> {
    // findAll es un atajo sobre paginate: fija pagina 1 y limita el maximo.
    const response = await this.paginate({
      page: 1,
      limit: this.normalizeLimit(limit),
      path: '',
    });

    return response.data;
  }

  findOne(perIdentificacion: string): Promise<FichaProductorIdentificacion> {
    return this.findByIdentificacion(perIdentificacion);
  }

  async findByIdentificacion(
    perIdentificacion: string,
  ): Promise<FichaProductorIdentificacion> {
    // Primero se valida el formato para evitar consultas inutiles o parametros
    // fuera del contrato funcional: identificaciones numericas de 10 a 13 digitos.
    this.validateIdentificacion(perIdentificacion);

    const productor = await this.fichaIdentificacionRepository.findOne({
      where: { per_identificacion: perIdentificacion },
    });

    if (!productor) {
      throw new NotFoundException('Productor no encontrado');
    }

    return productor;
  }

  async findContactos(perIdentificacion: string): Promise<FichaProductorContacto[]> {
    this.validateIdentificacion(perIdentificacion);
    try {
      // Contacto consolidado desde vw_ficha_productor_contacto_completo.
      // La llave de la vista es cedula_ruc (= identificación del productor).
      return await this.contactoRepository.find({
        where: { cedula_ruc: perIdentificacion },
        take: 1,
      });
    } catch {
      return [];
    }
  }

  findResumenProductivo(
    perIdentificacion: string,
  ): Promise<InteropProductorResumenIntegral | null> {
    this.validateIdentificacion(perIdentificacion);

    return this.resumenIntegralRepository.findOne({
      where: { per_identificacion: perIdentificacion },
    });
  }

  async findAgricola(
    perIdentificacion: string,
  ): Promise<FichaAgricolaProductorDto> {
    this.validateIdentificacion(perIdentificacion);

    // Resumen y detalle agricola se consultan en paralelo porque no dependen
    // entre si; esto reduce latencia de la ficha.
    const [resumen, cultivos] = await Promise.all([
      this.resumenAgricolaRepository.findOne({
        where: { per_identificacion: perIdentificacion },
      }),
      this.cultivoRepository.find({
        where: { per_identificacion: perIdentificacion },
        order: {
          cultivo: 'ASC',
        },
      }),
    ]);

    return {
      resumen,
      cultivos,
    };
  }

  async findPecuario(
    perIdentificacion: string,
  ): Promise<FichaPecuariaProductorDto> {
    this.validateIdentificacion(perIdentificacion);

    // Ficha pecuaria y resumen agregado salen de objetos distintos.
    const [ficha, resumen] = await Promise.all([
      this.fichaPecuarioRepository.findOne({
        where: { per_identificacion: perIdentificacion },
      }),
      this.findResumenPecuario(perIdentificacion),
    ]);

    return {
      ficha,
      resumen,
    };
  }

  findResumenPecuario(
    perIdentificacion: string,
  ): Promise<ResumenPecuarioProductor | null> {
    this.validateIdentificacion(perIdentificacion);

    return this.resumenPecuarioRepository.findOne({
      where: { per_identificacion: perIdentificacion },
    });
  }

  findExtension(
    perIdentificacion: string,
  ): Promise<FichaProductorExtensionAgropecuaria | null> {
    this.validateIdentificacion(perIdentificacion);

    return this.fichaExtensionRepository.findOne({
      where: { per_identificacion: perIdentificacion },
    });
  }

  findComplementarias(
    perIdentificacion: string,
  ): Promise<InteroperabilidadProductorComplementarias | null> {
    this.validateIdentificacion(perIdentificacion);

    return this.complementariasRepository.findOne({
      where: { per_identificacion: perIdentificacion },
    });
  }

  findUbicacion(
    perIdentificacion: string,
  ): Promise<Record<string, unknown> | null> {
    this.validateIdentificacion(perIdentificacion);

    return this.findOptionalJsonByIdentificacion(
      'v_ficha_productor_ubicacion_v1',
      'ubicacion',
      perIdentificacion,
    );
  }

  findTrazabilidad(
    perIdentificacion: string,
  ): Promise<Record<string, unknown> | null> {
    this.validateIdentificacion(perIdentificacion);

    return this.findOptionalJsonByIdentificacion(
      'v_ficha_productor_trazabilidad_v1',
      'trazabilidad',
      perIdentificacion,
    );
  }

  async findFichaIntegrada(
    perIdentificacion: string,
  ): Promise<FichaProductorIntegradaDto> {
    // La identificacion base es obligatoria. Si no existe, no se arma ficha.
    const identificacion = await this.findByIdentificacion(perIdentificacion);

    // Los demas bloques son independientes y se consultan en paralelo.
    // Algunos son opcionales y pueden volver null/[] si la vista no existe o no hay datos.
    const [
      contacto,
      ubicacion,
      resumenProductivo,
      agricola,
      pecuario,
      extension,
      complementarias,
      trazabilidad,
    ] = await Promise.all([
      this.findContactos(perIdentificacion),
      this.findUbicacion(perIdentificacion),
      this.findResumenProductivo(perIdentificacion),
      this.findAgricola(perIdentificacion),
      this.findPecuario(perIdentificacion),
      this.findExtension(perIdentificacion),
      this.findComplementarias(perIdentificacion),
      this.findTrazabilidad(perIdentificacion),
    ]);

    return {
      identificacion,
      contacto,
      ubicacion,
      resumenProductivo,
      agricola,
      pecuario,
      extension,
      complementarias,
      trazabilidad,
    };
  }

  async paginate(
    query: PaginateQuery,
    counter?: keyof ConsultaProductoresRenagro,
    rawQuery: Record<string, unknown> = {},
  ) {
    // Paginacion manual sobre SQL parametrizado para soportar filtros heredados
    // del frontend y mantener el universo RENAGRO por defecto.
    const page = this.normalizePage(query.page);
    const limit = this.normalizePageLimit(query.limit);
    const offset = (page - 1) * limit;
    const { whereClause, parameters } =
      this.buildInteroperabilidadProductoresFilters(query, rawQuery);

    const tableName =
      'sc_interop_renagro_magp.vw_tablero_interop_productores';

    const [countResult, data] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*)::int AS total FROM ${tableName} ${whereClause}`,
        parameters,
      ),
      this.dataSource.query(
        `
          SELECT
            per_identificacion,
            nombre_productor,
            registrado_en_renagro,
            registrado_en_infocampo,
            registrado_en_afc,
            fuentes_presentes,
            estado_cruce,
            tiene_duplicado,
            fecha_cruce
          FROM ${tableName}
          ${whereClause}
          ORDER BY fecha_cruce DESC NULLS LAST, per_identificacion ASC
          LIMIT $${parameters.length + 1}
          OFFSET $${parameters.length + 2}
        `,
        [...parameters, limit, offset],
      ),
    ]);

    const totalItems = Number(countResult?.[0]?.total ?? 0);
    const response = {
      data,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    };

    if (counter) {
      return {
        ...response,
        counter: null,
      };
    }

    return response;
  }

  async getTableroIdentificacion(query: Record<string, unknown>) {
    const { whereClause, parameters } = this.buildTableroFilters(query);
    const tableName =
      'sc_interop_renagro_magp.vw_tablero_interop_productores';
    const renagroClause = this.appendCondition(whereClause, 'registrado_en_renagro = TRUE');

    const [totals, porEstado, porFuentes, porDuplicado] = await Promise.all([
      this.dataSource.query(
        `
          SELECT
            COUNT(*) FILTER (WHERE registrado_en_renagro)::int AS total_productores_renagro,
            COUNT(*) FILTER (WHERE estado_cruce = 'SOLO_RENAGRO')::int AS solo_renagro,
            COUNT(*) FILTER (WHERE estado_cruce = 'RENAGRO_INFOCAMPO')::int AS renagro_infocampo,
            COUNT(*) FILTER (WHERE estado_cruce = 'RENAGRO_AFC')::int AS renagro_afc,
            COUNT(*) FILTER (WHERE registrado_en_renagro AND (registrado_en_infocampo OR registrado_en_afc))::int AS con_cruce_registro_administrativo,
            COUNT(*) FILTER (WHERE registrado_en_renagro AND NOT registrado_en_infocampo AND NOT registrado_en_afc)::int AS sin_cruce_registro_administrativo,
            MAX(fecha_cruce) AS fecha_generacion_vista
          FROM ${tableName}
          ${whereClause}
        `,
        parameters,
      ),
      this.groupCount(tableName, 'estado_cruce', renagroClause, parameters),
      this.groupCount(tableName, 'fuentes_presentes', renagroClause, parameters),
      this.groupCount(tableName, 'tiene_duplicado', renagroClause, parameters),
    ]);

    return {
      filtros: {
        estados: [
          'SOLO_RENAGRO',
          'RENAGRO_INFOCAMPO',
          'RENAGRO_AFC',
        ],
      },
      totales: totals[0] ?? {},
      distribuciones: {
        por_estado_cruce: porEstado,
        por_fuentes_presentes: porFuentes,
        por_tiene_duplicado: porDuplicado,
      },
    };
  }

  async getTableroContacto(_query: Record<string, unknown>) {
    return this.buildTableroModuloVacio(
      'Vista de contacto no disponible en el esquema actual',
    );
  }

  async getTableroUbicacion(_query: Record<string, unknown>) {
    return this.buildTableroModuloVacio(
      'Vista de ubicación no disponible en el esquema actual',
    );
  }

  async getTableroRiego(query: Record<string, unknown>) {
    const { whereClause, parameters } = this.buildTableroRiegoFilters(query);
    const tableName = 'sc_interop_renagro_magp.vw_dashboard_riego_productor_situacion';

    const countResult = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total_registros FROM ${tableName} ${whereClause}`,
      parameters,
    );
    const totalRegistros = Number(countResult?.[0]?.total_registros ?? 0);

    if (totalRegistros === 0) {
      return this.buildTableroModuloVacio(
        'Sin datos de riego para el período actual',
      );
    }

    const [totals, porFuente, porAccesoRiego, productores] = await Promise.all([
      this.dataSource.query(
        `
          SELECT
            COUNT(*)::int AS total_registros,
            COUNT(DISTINCT per_identificacion)::int AS total_productores
          FROM ${tableName}
          ${whereClause}
        `,
        parameters,
      ),
      this.groupCount(tableName, 'fuente', whereClause, parameters),
      this.groupCount(tableName, 'acceso_riego', whereClause, parameters, 10),
      this.dataSource.query(
        `
          SELECT
            per_identificacion,
            fuente,
            acceso_riego,
            sistema_riego,
            fuente_agua,
            tipo_riego,
            superficie_riego,
            estado_riego_dashboard
          FROM ${tableName}
          ${whereClause}
          ORDER BY per_identificacion ASC
          LIMIT 20
        `,
        parameters,
      ),
    ]);

    return {
      mensaje: 'Datos de riego disponibles',
      disponible: true,
      totales: totals[0] ?? {
        total_registros: totalRegistros,
        total_productores: 0,
      },
      distribuciones: {
        por_fuente: porFuente,
        por_acceso_riego: porAccesoRiego,
      },
      productores,
    };
  }

  async getTableroPecuario(query: Record<string, unknown>) {
    const { whereClause, parameters } = this.buildTableroPecuarioFilters(query);
    const tableName = 'sc_interop_renagro_magp.vw_dashboard_pecuario_productor_resumen';

    const [totals, porTipoAnimal, productores] = await Promise.all([
      this.dataSource.query(
        `
          SELECT
            COUNT(*)::int AS total_productores,
            COALESCE(SUM(total_registros_pecuarios::bigint), 0)::bigint AS total_registros_pecuarios,
            COALESCE(SUM(total_tipos_animales::bigint), 0)::bigint AS total_tipos_animales,
            COALESCE(SUM(total_animales::numeric), 0)::numeric AS total_animales,
            COALESCE(SUM(total_colmenas::numeric), 0)::numeric AS total_colmenas
          FROM ${tableName}
          ${whereClause}
        `,
        parameters,
      ),
      this.groupCount(tableName, 'tipos_animales_lista', whereClause, parameters, 20),
      this.dataSource.query(
        `
          SELECT
            per_identificacion,
            total_registros_pecuarios,
            total_tipos_animales,
            tipos_animales_lista,
            total_animales,
            total_colmenas
          FROM ${tableName}
          ${whereClause}
          ORDER BY total_registros_pecuarios DESC NULLS LAST, per_identificacion ASC
          LIMIT 20
        `,
        parameters,
      ),
    ]);

    return {
      totales: totals[0] ?? {},
      distribuciones: {
        por_tipo_animal: porTipoAnimal,
      },
      productores,
    };
  }

  async getTableroCultivosRubros(query: Record<string, unknown>) {
    const { whereClause, parameters } = this.buildTableroCultivosRubrosFilters(query);
    const tableName = 'sc_interop_renagro_magp.vw_dashboard_cultivos_productor_detalle';

    const [totals, porFuente, porCultivo, productores] = await Promise.all([
      this.dataSource.query(
        `
          SELECT
            COUNT(*)::int AS total_registros,
            COUNT(DISTINCT per_identificacion)::int AS total_productores,
            COUNT(DISTINCT cultivo)::int AS total_cultivos_distintos,
            ROUND(COALESCE(SUM(superficie_plantada), 0)::numeric, 2) AS superficie_total_plantada,
            ROUND(COALESCE(SUM(superficie_cosechada), 0)::numeric, 2) AS superficie_total_cosechada
          FROM ${tableName}
          ${whereClause}
        `,
        parameters,
      ),
      this.groupCount(tableName, 'fuente', whereClause, parameters),
      this.groupDistinctCount(tableName, 'cultivo', whereClause, parameters, 10),
      this.dataSource.query(
        `
          SELECT
            per_identificacion,
            fuente,
            cultivo,
            superficie_plantada,
            unidad_superficie_plantada,
            superficie_cosechada,
            unidad_superficie_cosechada,
            cantidad_cosechada,
            cantidad_producida,
            unidad_produccion,
            estado_interoperabilidad,
            estado_homologacion
          FROM ${tableName}
          ${whereClause}
          ORDER BY per_identificacion ASC, cultivo ASC
          LIMIT 20
        `,
        parameters,
      ),
    ]);

    return {
      totales: totals[0] ?? {},
      distribuciones: {
        por_fuente: porFuente,
        por_cultivo: porCultivo,
      },
      productores,
    };
  }

  private buildInteroperabilidadProductoresFilters(
    query: PaginateQuery,
    rawQuery: Record<string, unknown>,
  ) {
    // Traduce query params y filtros nestjs-paginate a WHERE + parametros.
    // Los valores se pasan como $1, $2... para evitar interpolar datos del usuario.
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    const addCondition = (condition: string, value: unknown) => {
      parameters.push(value);
      conditions.push(`${condition} $${parameters.length}`);
    };

    const identificacion =
      this.getPaginateFilterValue(query, rawQuery, 'per_identificacion') ||
      this.getRawQueryValue(rawQuery, 'identificacion');
    const estado =
      this.getPaginateFilterValue(query, rawQuery, 'estado_cruce') ||
      this.getRawQueryValue(rawQuery, 'estado');
    const fuente =
      this.getRawQueryValue(rawQuery, 'fuente') ||
      this.getFuenteFromRegisteredFilter(query, rawQuery);
    const fechaDesde = this.getRawQueryValue(rawQuery, 'fechaDesde');
    const fechaHasta = this.getRawQueryValue(rawQuery, 'fechaHasta');
    const search = String(query.search || rawQuery['search'] || '').trim();
    const incluirExternos = this.getRawQueryValue(rawQuery, 'incluirExternos');

    // Regla rectora: por defecto el listado es el universo RENAGRO (sin RENAGRO
    // no hay productor interoperado). Solo se incluyen registros externos
    // (SOLO_INFOCAMPO / SOLO_AFC) cuando se pide explicitamente con incluirExternos.
    const soloRenagro = !['true', '1', 'si', 'sí'].includes(
      incluirExternos.toLowerCase(),
    );

    if (soloRenagro) {
      conditions.push('registrado_en_renagro = TRUE');
    }

    if (identificacion) {
      addCondition('per_identificacion =', identificacion);
    }

    if (estado) {
      const normalizedEstado = this.normalizeEstadoCruce(String(estado));
      if (normalizedEstado) {
        addCondition('estado_cruce =', normalizedEstado);
      }
    }

    if (fuente) {
      const normalizedFuente = String(fuente).trim().toUpperCase();
      if (normalizedFuente === 'INFOCAMPO') {
        conditions.push('registrado_en_infocampo = TRUE');
      }
      if (normalizedFuente === 'RENAGRO') {
        conditions.push('registrado_en_renagro = TRUE');
      }
      if (normalizedFuente === 'AFC') {
        conditions.push('registrado_en_afc = TRUE');
      }
    }

    if (fechaDesde) {
      this.validateDateFilter(fechaDesde, 'fechaDesde');
      addCondition('fecha_cruce::date >=', fechaDesde);
    }

    if (fechaHasta) {
      this.validateDateFilter(fechaHasta, 'fechaHasta');
      addCondition('fecha_cruce::date <=', fechaHasta);
    }

    if (search) {
      parameters.push(`%${search}%`);
      conditions.push(
        `(per_identificacion ILIKE $${parameters.length} OR nombre_productor ILIKE $${parameters.length})`,
      );
    }

    return {
      whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
      parameters,
    };
  }

  private getPaginateFilterValue(
    query: PaginateQuery,
    rawQuery: Record<string, unknown>,
    field: string,
  ): string {
    const rawFilter = rawQuery[`filter.${field}`];
    const filter = query.filter?.[field] ?? rawFilter;
    const value = Array.isArray(filter) ? filter[0] : filter;

    return this.unwrapFilterValue(value);
  }

  private getRawQueryValue(
    rawQuery: Record<string, unknown>,
    field: string,
  ): string {
    const value = rawQuery[field];
    const firstValue = Array.isArray(value) ? value[0] : value;

    return String(firstValue || '').trim();
  }

  private getFuenteFromRegisteredFilter(
    query: PaginateQuery,
    rawQuery: Record<string, unknown>,
  ): string {
    if (
      this.getPaginateFilterValue(query, rawQuery, 'registrado_en_infocampo')
    ) {
      return 'INFOCAMPO';
    }

    if (this.getPaginateFilterValue(query, rawQuery, 'registrado_en_renagro')) {
      return 'RENAGRO';
    }

    if (this.getPaginateFilterValue(query, rawQuery, 'registrado_en_afc')) {
      return 'AFC';
    }

    return '';
  }

  private unwrapFilterValue(value: unknown): string {
    const normalized = String(value || '').trim();

    if (!normalized) {
      return '';
    }

    return normalized.replace(/^\$eq:/, '').trim();
  }

  private normalizeEstadoCruce(value: string): string {
    // Valores reales de estado_cruce en vw_tablero_interop_productores.
    // Se acepta el alias INFOCAMPO_RENAGRO -> RENAGRO_INFOCAMPO por compatibilidad
    // con clientes antiguos; el resto se valida tal cual contra el catalogo real.
    const estado = value.trim().toUpperCase();
    if (estado === 'INFOCAMPO_RENAGRO') {
      return 'RENAGRO_INFOCAMPO';
    }

    const estadosValidos = new Set([
      'SOLO_RENAGRO',
      'RENAGRO_INFOCAMPO',
      'RENAGRO_AFC',
      'SOLO_INFOCAMPO',
      'SOLO_AFC',
      'INFOCAMPO_AFC_SIN_RENAGRO',
    ]);

    return estadosValidos.has(estado) ? estado : '';
  }

  private validateDateFilter(value: string, field: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(
        `El filtro ${field} debe tener formato YYYY-MM-DD`,
      );
    }
  }

  private normalizePage(page?: number): number {
    const parsedPage = Number(page || 1);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException(
        'La pagina debe ser un entero mayor a cero',
      );
    }

    return parsedPage;
  }

  private normalizePageLimit(limit?: number): number {
    const parsedLimit = Number(limit || 10);

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      throw new BadRequestException(
        'El limite debe ser un entero mayor a cero',
      );
    }

    return Math.min(parsedLimit, 100);
  }

  private normalizeLimit(limit?: string): number {
    if (!limit) {
      return this.defaultFindAllLimit;
    }

    const parsedLimit = Number(limit);

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      throw new BadRequestException(
        'El limite debe ser un entero mayor a cero',
      );
    }

    return Math.min(parsedLimit, this.maxFindAllLimit);
  }

  private buildTableroFilters(query: Record<string, unknown>) {
    // Filtros compartidos por tableros de identificacion/fuentes.
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    const addEquals = (field: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      parameters.push(value);
      conditions.push(`${field} = $${parameters.length}`);
    };

    addEquals('per_identificacion', query['identificacion']);
    addEquals('estado_cruce', query['estado']);

    if (query['fuente']) {
      const fieldBySource: Record<string, string> = {
        INFOCAMPO: 'registrado_en_infocampo',
        AFC: 'registrado_en_afc',
        RENAGRO: 'registrado_en_renagro',
      };
      const field = fieldBySource[String(query['fuente']).toUpperCase()];

      if (field) {
        conditions.push(`${field} = TRUE`);
      }
    }

    if (query['busqueda']) {
      parameters.push(`%${String(query['busqueda']).trim()}%`);
      conditions.push(
        `(per_identificacion ILIKE $${parameters.length} OR nombre_productor ILIKE $${parameters.length})`,
      );
    }

    return {
      whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
      parameters,
    };
  }

  private buildTableroPecuarioFilters(query: Record<string, unknown>) {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    const addEquals = (field: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      parameters.push(value);
      conditions.push(`${field} = $${parameters.length}`);
    };

    addEquals('per_identificacion', query['identificacion']);

    if (query['busqueda']) {
      parameters.push(`%${String(query['busqueda']).trim()}%`);
      conditions.push(`per_identificacion ILIKE $${parameters.length}`);
    }

    return {
      whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
      parameters,
    };
  }

  private buildTableroRiegoFilters(query: Record<string, unknown>) {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    const addEquals = (field: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      parameters.push(value);
      conditions.push(`${field} = $${parameters.length}`);
    };

    addEquals('per_identificacion', query['identificacion']);
    addEquals('fuente', query['fuente']);

    if (query['busqueda']) {
      parameters.push(`%${String(query['busqueda']).trim()}%`);
      conditions.push(`per_identificacion ILIKE $${parameters.length}`);
    }

    return {
      whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
      parameters,
    };
  }

  private buildTableroModuloVacio(mensaje: string) {
    // Contrato estable para modulos cuya vista aun no esta disponible.
    // El frontend recibe 200 y puede renderizar estado vacio controlado.
    return {
      mensaje,
      disponible: false,
      totales: {
        total_registros: 0,
        total_productores: 0,
      },
      distribuciones: {},
      productores: [],
    };
  }

  private buildTableroCultivosRubrosFilters(query: Record<string, unknown>) {
    const conditions: string[] = [];
    const parameters: unknown[] = [];
    const addEquals = (field: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      parameters.push(value);
      conditions.push(`${field} = $${parameters.length}`);
    };

    addEquals('per_identificacion', query['identificacion']);
    addEquals('fuente', query['fuente']);
    addEquals('cultivo', query['cultivo']);

    if (query['busqueda']) {
      parameters.push(`%${String(query['busqueda']).trim()}%`);
      conditions.push(
        `(per_identificacion ILIKE $${parameters.length} OR cultivo ILIKE $${parameters.length})`,
      );
    }

    return {
      whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
      parameters,
    };
  }

  private groupCount(
    tableName: string,
    field: string,
    whereClause: string,
    parameters: unknown[],
    limit?: number,
  ) {
    // Helper de agregacion simple: cuenta registros por un campo de una vista.
    const limitClause = limit ? `LIMIT ${limit}` : '';

    return this.dataSource.query(
      `
        SELECT ${field} AS valor, COUNT(*)::int AS total
        FROM ${tableName}
        ${whereClause}
        GROUP BY ${field}
        ORDER BY total DESC NULLS LAST
        ${limitClause}
      `,
      parameters,
    );
  }

  private groupDistinctCount(
    tableName: string,
    field: string,
    whereClause: string,
    parameters: unknown[],
    limit?: number,
  ) {
    const limitClause = limit ? `LIMIT ${limit}` : '';

    return this.dataSource.query(
      `
        SELECT ${field} AS valor, COUNT(DISTINCT per_identificacion)::int AS total
        FROM ${tableName}
        ${whereClause}
        GROUP BY ${field}
        ORDER BY total DESC NULLS LAST
        ${limitClause}
      `,
      parameters,
    );
  }

  private appendCondition(whereClause: string, condition: string): string {
    if (!whereClause) {
      return `WHERE ${condition}`;
    }

    return `${whereClause} AND ${condition}`;
  }

  private validateIdentificacion(perIdentificacion: string): void {
    // Regla defensiva centralizada para todos los endpoints por productor.
    if (!perIdentificacion || !/^[0-9]{10,13}$/.test(perIdentificacion)) {
      throw new BadRequestException(
        'La identificacion debe contener solo numeros y tener entre 10 y 13 digitos',
      );
    }
  }

  private async findOptionalJsonByIdentificacion(
    viewName: string,
    alias: string,
    perIdentificacion: string,
  ): Promise<Record<string, unknown> | null> {
    // Algunas vistas complementarias pueden no existir en todos los ambientes.
    // Si TypeORM/PostgreSQL reporta fallo de consulta, se responde null para
    // conservar la ficha integrada sin romper el endpoint completo.
    try {
      const rows: unknown = await this.dataSource.query(
        `
          SELECT to_jsonb(${alias}) AS data
          FROM sc_interop_renagro_magp.${viewName} ${alias}
          WHERE ${alias}.per_identificacion = $1
          LIMIT 1
        `,
        [perIdentificacion],
      );

      if (!Array.isArray(rows)) {
        return null;
      }

      const firstRow = rows[0] as { data?: unknown } | undefined;

      if (this.isRecord(firstRow?.data)) {
        return firstRow.data;
      }

      return null;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return null;
      }

      throw error;
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
