import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_tablero_productor_360',
})
export class InteropProductorResumenIntegral {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @Column({ type: 'text', nullable: true })
  estado_cruce?: string;

  @Column({ type: 'text', nullable: true })
  fuentes_presentes?: string;

  @Column({ type: 'text', nullable: true })
  nombre_renagro?: string;

  @Column({ type: 'text', nullable: true })
  nombre_infocampo?: string;

  @Column({ type: 'text', nullable: true })
  nombre_afc?: string;

  @Column({ type: 'text', nullable: true })
  estado_homologacion?: string;

  @Column({ type: 'boolean', nullable: true })
  candidato_insert_renagro?: boolean;

  @Column({ type: 'boolean', nullable: true })
  candidato_update_renagro?: boolean;

  @Column({ type: 'boolean', nullable: true })
  sin_accion?: boolean;

  @Column({ type: 'text', nullable: true })
  observacion_homologacion?: string;

  @Column({ type: 'bigint', nullable: true })
  total_conflictos?: string;

  @Column({ type: 'bigint', nullable: true })
  total_brechas?: string;
}
