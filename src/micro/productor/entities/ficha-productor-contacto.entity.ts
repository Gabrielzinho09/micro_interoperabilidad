import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Contacto consolidado del productor.
 * Fuente: sc_interop_renagro_magp.vw_ficha_productor_contacto_completo
 * Llave de búsqueda: cedula_ruc (= per_identificacion del productor).
 */
@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_ficha_productor_contacto_completo',
})
export class FichaProductorContacto {
  @PrimaryColumn({ type: 'text' })
  cedula_ruc!: string;

  @Column({ type: 'text', nullable: true })
  nombre_productor?: string;

  @Column({ type: 'text', nullable: true })
  celular?: string;

  @Column({ type: 'text', nullable: true })
  telefono_fijo?: string;

  @Column({ type: 'text', nullable: true })
  correo_electronico?: string;

  @Column({ type: 'text', nullable: true })
  fuente_celular?: string;

  @Column({ type: 'text', nullable: true })
  fuente_telefono_fijo?: string;

  @Column({ type: 'text', nullable: true })
  fuente_correo?: string;

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

  @Column({ type: 'text', nullable: true })
  estado_interoperabilidad?: string;

  @Column({ type: 'text', nullable: true })
  estado_contacto?: string;

  @Column({ type: 'text', nullable: true })
  observacion_contacto?: string;
}
