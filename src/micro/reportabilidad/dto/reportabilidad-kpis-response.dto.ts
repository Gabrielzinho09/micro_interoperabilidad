import { ApiProperty } from '@nestjs/swagger';

export class ReportabilidadKpiTotalesDto {
  @ApiProperty({ example: '291531' })
  total_renagro!: string;

  @ApiProperty({ example: '1' })
  enriquecidos_afc!: string;

  @ApiProperty({ example: '60546' })
  enriquecidos_infocampo!: string;

  @ApiProperty({ example: '60547' })
  total_enriquecidos!: string;

  @ApiProperty({ example: '230984' })
  solo_renagro!: string;

  @ApiProperty({ example: '20.77', nullable: true })
  pct_enriquecidos!: string | null;
}

export class ReportabilidadKpisResponseDto {
  @ApiProperty({ type: ReportabilidadKpiTotalesDto })
  totales!: ReportabilidadKpiTotalesDto;

  @ApiProperty({
    description: 'Distribuciones opcionales (vacío en implementación actual)',
    example: {},
  })
  distribuciones!: Record<string, unknown>;
}
