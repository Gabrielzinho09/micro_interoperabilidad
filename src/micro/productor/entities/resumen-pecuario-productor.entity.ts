import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_dashboard_pecuario_productor_resumen',
})
export class ResumenPecuarioProductor {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @Column({ type: 'bigint', nullable: true })
  total_registros_pecuarios?: string;

  @Column({ type: 'bigint', nullable: true })
  total_tipos_animales?: string;

  @Column({ type: 'text', nullable: true })
  tipos_animales_lista?: string;

  @Column({ type: 'numeric', nullable: true })
  total_animales?: string;

  @Column({ type: 'numeric', nullable: true })
  total_colmenas?: string;
}
