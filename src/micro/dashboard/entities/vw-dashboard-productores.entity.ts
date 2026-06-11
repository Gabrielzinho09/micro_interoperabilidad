import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Vista oficial del universo RENAGRO (291.531 productores).
 * Todos los registros aqui CUMPLEN la regla rectora: tienen presencia en RENAGRO.
 * NO usar `vw_tablero_interop_productores` (incluye SOLO_INFOCAMPO/SOLO_AFC).
 */
@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_dashboard_productores',
})
export class VwDashboardProductores {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @Column({ type: 'text', nullable: true })
  nombre_productor?: string;

  @Column({ type: 'text', nullable: true })
  estado_interoperabilidad?: string;

  @Column({ type: 'text', nullable: true })
  fuentes_presentes?: string;

  @Column({ type: 'boolean', nullable: true })
  registrado_en_renagro?: boolean;

  @Column({ type: 'boolean', nullable: true })
  registrado_en_infocampo?: boolean;

  @Column({ type: 'boolean', nullable: true })
  registrado_en_afc?: boolean;

  @Column({ type: 'integer', nullable: true })
  numero_fuentes?: number;

  @Column({ type: 'boolean', nullable: true })
  es_brecha_renagro?: boolean;

  @Column({ type: 'boolean', nullable: true })
  es_conflicto_identidad?: boolean;

  @Column({ type: 'text', nullable: true })
  estado_homologacion?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha_homologacion?: Date;
}
