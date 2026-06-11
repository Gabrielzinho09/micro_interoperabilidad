import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Entidad TypeORM para una vista de productores interoperados.
 * En vistas sin id numerico, per_identificacion funciona como llave logica.
 */
@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_dashboard_productores',
})
export class ConsultaProductoresRenagro {
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
