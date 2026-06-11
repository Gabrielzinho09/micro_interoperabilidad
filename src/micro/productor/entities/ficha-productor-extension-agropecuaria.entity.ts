import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_dashboard_extension_productor',
})
export class FichaProductorExtensionAgropecuaria {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @PrimaryColumn({ type: 'text' })
  fuente!: string;

  @Column({ type: 'boolean', nullable: true })
  asistencia_tecnica?: boolean;

  @Column({ type: 'text', nullable: true })
  detalle_asistencia?: string;

  @Column({ type: 'bigint', nullable: true })
  total_visitas_asistencia?: string;

  @Column({ type: 'date', nullable: true })
  fecha_primera_visita?: string;

  @Column({ type: 'date', nullable: true })
  fecha_ultima_visita?: string;

  @Column({ type: 'text', nullable: true })
  tipo_movilizacion_priorizado?: string;

  @Column({ type: 'text', nullable: true })
  extension_servicio?: string;

  @Column({ type: 'text', nullable: true })
  extension_recibir?: string;

  @Column({ type: 'text', nullable: true })
  tecnico_identificacion?: string;

  @Column({ type: 'text', nullable: true })
  tecnico_nombre?: string;

  @Column({ type: 'text', nullable: true })
  estado_interoperabilidad?: string;

  @Column({ type: 'text', nullable: true })
  accion_sugerida?: string;

  @Column({ type: 'text', nullable: true })
  estado_homologacion?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha_homologacion?: Date;
}
