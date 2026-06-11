import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_dashboard_cultivos_productor_detalle',
})
export class InteropProductorCultivo {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @PrimaryColumn({ type: 'text' })
  fuente!: string;

  @PrimaryColumn({ type: 'text' })
  cultivo!: string;

  @Column({ type: 'double precision', nullable: true })
  superficie_plantada?: number;

  @Column({ type: 'text', nullable: true })
  unidad_superficie_plantada?: string;

  @Column({ type: 'double precision', nullable: true })
  superficie_cosechada?: number;

  @Column({ type: 'text', nullable: true })
  unidad_superficie_cosechada?: string;

  @Column({ type: 'numeric', nullable: true })
  cantidad_cosechada?: string;

  @Column({ type: 'numeric', nullable: true })
  cantidad_producida?: string;

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
