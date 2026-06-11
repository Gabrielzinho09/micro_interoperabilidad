import { ApiProperty } from '@nestjs/swagger';

/**
 * Contrato estable para módulos de tablero sin vista activa o sin datos en BD.
 * Usado por contacto, ubicación y riego (cuando vw_dashboard_riego_productor está vacía).
 */
export class TableroModuloVacioDto {
  @ApiProperty({
    description: 'Mensaje operativo para UI/QA',
    example: 'Sin datos de riego para el período actual',
  })
  mensaje!: string;

  @ApiProperty({
    description: 'Indica si el módulo tiene datos consultables en el esquema activo',
    example: false,
  })
  disponible!: boolean;

  @ApiProperty({
    description: 'Totales agregados del módulo (vacío o en cero cuando no hay datos)',
    example: { total_registros: 0, total_productores: 0 },
  })
  totales!: Record<string, unknown>;

  @ApiProperty({
    description: 'Distribuciones del módulo (objeto vacío cuando no hay datos)',
    example: {},
  })
  distribuciones!: Record<string, unknown>;

  @ApiProperty({
    description: 'Detalle por productor (arreglo vacío cuando no hay datos)',
    type: 'array',
    items: { type: 'object' },
    example: [],
  })
  productores!: unknown[];
}
