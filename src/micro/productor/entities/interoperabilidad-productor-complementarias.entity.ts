import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_dashboard_asociacion_productor',
})
export class InteroperabilidadProductorComplementarias {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @Column({ type: 'text', nullable: true })
  fuente?: string;

  @Column({ type: 'boolean', nullable: true })
  pertenece_asociacion?: boolean;

  @Column({ type: 'text', nullable: true })
  asociacion?: string;

  @Column({ type: 'text', nullable: true })
  tipo_asociacion?: string;

  @Column({ type: 'text', nullable: true })
  ruc_asociacion?: string;

  @Column({ type: 'numeric', nullable: true })
  total_socios?: string;

  @Column({ type: 'text', nullable: true })
  estado_interoperabilidad?: string;

  @Column({ type: 'text', nullable: true })
  accion_sugerida?: string;

  @Column({ type: 'text', nullable: true })
  estado_homologacion?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha_homologacion?: Date;
}
