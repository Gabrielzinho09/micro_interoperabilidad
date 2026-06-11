import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_dashboard_cultivos_productor_resumen',
})
export class ResumenAgricolaProductor {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @Column({ type: 'bigint', nullable: true })
  total_registros_cultivo?: string;

  @Column({ type: 'bigint', nullable: true })
  total_cultivos_distintos?: string;

  @Column({ type: 'text', nullable: true })
  cultivos_lista?: string;
}
