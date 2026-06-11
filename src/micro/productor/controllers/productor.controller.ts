import {
  Controller,
  Get,
  Param,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';
import { FichaAgricolaProductorDto } from '../dto/ficha-agricola-productor.dto';
import { FichaPecuariaProductorDto } from '../dto/ficha-pecuaria-productor.dto';
import { FichaProductorIntegradaDto } from '../dto/ficha-productor-integrada.dto';
import { TableroModuloVacioDto } from '../dto/tablero-modulo-vacio.dto';
import { ConsultaProductoresRenagro } from '../entities/consulta-productores-renagro.entity';
import { FichaProductorContacto } from '../entities/ficha-productor-contacto.entity';
import { FichaProductorExtensionAgropecuaria } from '../entities/ficha-productor-extension-agropecuaria.entity';
import { FichaProductorIdentificacion } from '../entities/ficha-productor-identificacion.entity';
import { InteroperabilidadProductorComplementarias } from '../entities/interoperabilidad-productor-complementarias.entity';
import { ProductorService } from '../services/productor.service';

/**
 * Controlador REST del dominio Productor.
 *
 * Responsabilidad: recibir parametros/query params HTTP, documentar contratos
 * Swagger y delegar la logica al ProductorService. No accede directamente a BD.
 */
@ApiTags('Micro Productor')
@ApiSecurity('X-API-KEY', ['X-API-KEY'])
@UseGuards(AuthGuard('api-key'))
@Controller('micro-template/v1/productor')
@UseFilters(new HttpExceptionFilter())
export class ProductorController {
  constructor(private microProductorService: ProductorService) {}

  // Listado simple: reutiliza la paginacion del servicio y devuelve solo data.
  @Get('/findAll')
  @ApiOperation({
    summary: 'Obtener listado base de productores',
    description:
      'Consulta read-only sobre sc_infocampo_interop_renagro.stg_infocampo_renagro_productor_cruce para la presentacion urgente INFOCAMPO vs RENAGRO.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad maxima de registros a devolver. Maximo 1000.',
    example: 100,
  })
  @ApiOkResponse({
    description: 'Listado base de productores',
    type: [ConsultaProductoresRenagro],
  })
  findAll(
    @Query('limit') limit?: string,
  ): Promise<ConsultaProductoresRenagro[]> {
    return this.microProductorService.findAll(limit);
  }

  @Get('/paginate/findAll')
  @ApiOperation({
    summary: 'Obtener listado base de productores paginado',
    description:
      'Consulta paginada read-only sobre sc_infocampo_interop_renagro.stg_infocampo_renagro_productor_cruce para la presentacion urgente INFOCAMPO vs RENAGRO.',
  })
  public paginate(
    @Paginate() query: PaginateQuery,
    @Query() rawQuery: Record<string, unknown>,
    @Query('counter') counter?: keyof ConsultaProductoresRenagro,
  ) {
    return this.microProductorService.paginate(query, counter, rawQuery);
  }

  // Tableros agregados: devuelven totales/distribuciones para vistas del frontend.
  @Get('/tablero-identificacion')
  @ApiOperation({
    summary: 'Obtener tablero de identificacion y estado del productor',
    description:
      'Consulta agregada read-only sobre sc_interop_renagro_magp.v_consulta_productores_renagro_v1 para el tablero dinamico de productores con RENAGRO como fuente rectora.',
  })
  getTableroIdentificacion(@Query() query: Record<string, unknown>) {
    return this.microProductorService.getTableroIdentificacion(query);
  }

  @Get('/tablero-contacto')
  @ApiOperation({
    summary: 'Obtener tablero de contacto del productor',
    description:
      'Modulo en modo fallback: la vista de contacto no existe en sc_interop_renagro_magp. Responde 200 con estructura vacia estable (TableroModuloVacioDto).',
  })
  @ApiOkResponse({
    description: 'Tablero de contacto (fallback sin datos)',
    type: TableroModuloVacioDto,
  })
  getTableroContacto(@Query() query: Record<string, unknown>) {
    return this.microProductorService.getTableroContacto(query);
  }

  @Get('/tablero-ubicacion')
  @ApiOperation({
    summary: 'Obtener tablero de ubicacion del productor',
    description:
      'Modulo en modo fallback: la vista de ubicacion no existe en sc_interop_renagro_magp. Responde 200 con estructura vacia estable (TableroModuloVacioDto).',
  })
  @ApiOkResponse({
    description: 'Tablero de ubicacion (fallback sin datos)',
    type: TableroModuloVacioDto,
  })
  getTableroUbicacion(@Query() query: Record<string, unknown>) {
    return this.microProductorService.getTableroUbicacion(query);
  }

  @Get('/tablero-riego')
  @ApiOperation({
    summary: 'Obtener tablero de riego del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.vw_dashboard_riego_productor. Si la vista no tiene filas, responde 200 con TableroModuloVacioDto.',
  })
  @ApiOkResponse({
    description: 'Tablero de riego (con datos o vacio controlado)',
    type: TableroModuloVacioDto,
  })
  getTableroRiego(@Query() query: Record<string, unknown>) {
    return this.microProductorService.getTableroRiego(query);
  }

  @Get('/tablero-pecuario')
  @ApiOperation({
    summary: 'Obtener tablero de actividad agropecuaria del productor',
    description:
      'Consulta agregada read-only sobre sc_interop_renagro_magp.v_tablero_actividad_agropecuaria_renagro_v1 para cultivos/rubros, actividad pecuaria, asociacion y riego.',
  })
  getTableroPecuario(@Query() query: Record<string, unknown>) {
    return this.microProductorService.getTableroPecuario(query);
  }

  @Get('/tablero-cultivos-rubros')
  @ApiOperation({
    summary: 'Obtener tablero de cultivos y rubros',
    description:
      'Consulta agregada read-only sobre sc_interop_renagro_magp.v_tablero_cultivos_rubros_renagro_v1 para forma de cultivo, fertilizantes y control de plagas.',
  })
  getTableroCultivosRubros(@Query() query: Record<string, unknown>) {
    return this.microProductorService.getTableroCultivosRubros(query);
  }

  @Get('/identificacion/:cedula')
  @ApiOperation({
    summary: 'Obtener identificacion del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.v_ficha_productor_identificacion_v1',
  })
  @ApiParam({
    name: 'cedula',
    description:
      'Identificacion del productor registrada en per_identificacion',
    example: '0100031426',
  })
  @ApiOkResponse({
    description: 'Productor encontrado',
    type: FichaProductorIdentificacion,
  })
  @ApiNotFoundResponse({
    description: 'Productor no encontrado',
  })
  findByIdentificacion(
    @Param('cedula') cedula: string,
  ): Promise<FichaProductorIdentificacion> {
    return this.microProductorService.findByIdentificacion(cedula);
  }

  // Ficha integrada: compone varios bloques funcionales de un mismo productor.
  @Get('/identificacion/:cedula/ficha')
  @ApiOperation({
    summary: 'Obtener ficha integrada del productor',
    description:
      'Compone datos read-only desde vistas/tablas consolidadas de identificacion, contacto, ubicacion, resumen productivo, agricola, pecuario, extension, complementarias y trazabilidad.',
  })
  @ApiParam({
    name: 'cedula',
    description:
      'Identificacion del productor registrada en per_identificacion',
    example: '0100031426',
  })
  @ApiOkResponse({
    description: 'Ficha integrada encontrada',
    type: FichaProductorIntegradaDto,
  })
  @ApiNotFoundResponse({
    description: 'Productor no encontrado',
  })
  findFichaIntegrada(
    @Param('cedula') cedula: string,
  ): Promise<FichaProductorIntegradaDto> {
    return this.microProductorService.findFichaIntegrada(cedula);
  }

  @Get('/:perIdentificacion/contacto')
  @ApiOperation({
    summary: 'Obtener contactos del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.v_ficha_productor_contacto_v1',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  @ApiOkResponse({
    description: 'Contactos del productor',
    type: [FichaProductorContacto],
  })
  findContactos(
    @Param('perIdentificacion') perIdentificacion: string,
  ): Promise<FichaProductorContacto[]> {
    return this.microProductorService.findContactos(perIdentificacion);
  }

  @Get('/:perIdentificacion/ubicacion')
  @ApiOperation({
    summary: 'Obtener ubicacion territorial del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.v_ficha_productor_ubicacion_v1 cuando la vista oficial esta disponible.',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  findUbicacion(
    @Param('perIdentificacion') perIdentificacion: string,
  ): Promise<Record<string, unknown> | null> {
    return this.microProductorService.findUbicacion(perIdentificacion);
  }

  @Get('/:perIdentificacion/agricola')
  @ApiOperation({
    summary: 'Obtener bloque agricola del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.resumen_agricola_productor_v1 e interop_productor_cultivo_v1',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  @ApiOkResponse({
    description: 'Resumen y detalle agricola del productor',
    type: FichaAgricolaProductorDto,
  })
  findAgricola(
    @Param('perIdentificacion') perIdentificacion: string,
  ): Promise<FichaAgricolaProductorDto> {
    return this.microProductorService.findAgricola(perIdentificacion);
  }

  @Get('/:perIdentificacion/pecuario')
  @ApiOperation({
    summary: 'Obtener bloque pecuario del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.v_ficha_productor_pecuario_v2 y resumen_pecuario_productor_v2',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  @ApiOkResponse({
    description: 'Ficha y resumen pecuario del productor',
    type: FichaPecuariaProductorDto,
  })
  findPecuario(
    @Param('perIdentificacion') perIdentificacion: string,
  ): Promise<FichaPecuariaProductorDto> {
    return this.microProductorService.findPecuario(perIdentificacion);
  }

  @Get('/:perIdentificacion/pecuario/resumen')
  @ApiOperation({
    summary: 'Obtener resumen pecuario agregado del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.resumen_pecuario_productor_v2',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  findResumenPecuario(@Param('perIdentificacion') perIdentificacion: string) {
    return this.microProductorService.findResumenPecuario(perIdentificacion);
  }

  @Get('/:perIdentificacion/extension')
  @ApiOperation({
    summary: 'Obtener extension agropecuaria del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.v_ficha_productor_extension_agropecuaria_v4',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  @ApiOkResponse({
    description: 'Extension agropecuaria del productor',
    type: FichaProductorExtensionAgropecuaria,
  })
  findExtension(
    @Param('perIdentificacion') perIdentificacion: string,
  ): Promise<FichaProductorExtensionAgropecuaria | null> {
    return this.microProductorService.findExtension(perIdentificacion);
  }

  @Get('/:perIdentificacion/complementarias')
  @ApiOperation({
    summary: 'Obtener variables complementarias del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.interop_variables_complementarias_productor_v1',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  @ApiOkResponse({
    description: 'Variables complementarias del productor',
    type: InteroperabilidadProductorComplementarias,
  })
  findComplementarias(
    @Param('perIdentificacion') perIdentificacion: string,
  ): Promise<InteroperabilidadProductorComplementarias | null> {
    return this.microProductorService.findComplementarias(perIdentificacion);
  }

  @Get('/:perIdentificacion/trazabilidad')
  @ApiOperation({
    summary: 'Obtener trazabilidad individual del productor',
    description:
      'Consulta read-only sobre sc_interop_renagro_magp.v_ficha_productor_trazabilidad_v1 cuando la vista oficial esta disponible.',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  findTrazabilidad(
    @Param('perIdentificacion') perIdentificacion: string,
  ): Promise<Record<string, unknown> | null> {
    return this.microProductorService.findTrazabilidad(perIdentificacion);
  }

  @Get('/:perIdentificacion')
  @ApiOperation({
    summary: 'Obtener identificacion del productor',
    description:
      'Alias read-only de identificacion que usa per_identificacion como llave funcional.',
  })
  @ApiParam({
    name: 'perIdentificacion',
    description: 'Identificacion del productor',
    example: '0100031426',
  })
  @ApiOkResponse({
    description: 'Productor encontrado',
    type: FichaProductorIdentificacion,
  })
  findOne(
    @Param('perIdentificacion') perIdentificacion: string,
  ): Promise<FichaProductorIdentificacion> {
    return this.microProductorService.findOne(perIdentificacion);
  }
}
