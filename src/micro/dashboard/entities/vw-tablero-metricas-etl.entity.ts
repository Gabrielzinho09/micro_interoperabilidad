import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_tablero_metricas_etl',
})
export class VwTableroMetricasEtl {
  @PrimaryColumn({ type: 'bigint' })
  id_ejecucion!: string;

  @Column({ type: 'text', nullable: true })
  nombre_job?: string;

  @Column({ type: 'text', nullable: true })
  ambiente?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha_inicio?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha_fin?: Date;

  @Column({ type: 'text', nullable: true })
  estado_ejecucion?: string;

  @Column({ type: 'bigint', nullable: true })
  registros_procesados?: string;

  @Column({ type: 'bigint', nullable: true })
  registros_hom?: string;

  @Column({ type: 'bigint', nullable: true })
  registros_pend?: string;

  @Column({ type: 'bigint', nullable: true })
  registros_rej?: string;
}
