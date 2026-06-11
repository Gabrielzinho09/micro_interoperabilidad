import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_dashboard_pecuario_productor_detalle',
})
export class FichaProductorPecuario {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @PrimaryColumn({ type: 'text' })
  fuente!: string;

  @PrimaryColumn({ type: 'text' })
  tipo_animal!: string;

  @Column({ type: 'numeric', nullable: true })
  cantidad_animales?: string;

  @Column({ type: 'numeric', nullable: true })
  cantidad_colmenas?: string;

  @Column({ type: 'numeric', nullable: true })
  cantidad_produccion?: string;

  @Column({ type: 'text', nullable: true })
  unidad_produccion?: string;

  @Column({ type: 'text', nullable: true })
  estado_interoperabilidad?: string;

  @Column({ type: 'text', nullable: true })
  accion_sugerida?: string;

  @Column({ type: 'text', nullable: true })
  estado_homologacion?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha_homologacion?: Date;
}
