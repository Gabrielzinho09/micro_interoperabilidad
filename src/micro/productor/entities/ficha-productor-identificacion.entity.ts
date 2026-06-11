import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_tablero_interop_productores',
})
export class FichaProductorIdentificacion {
  @PrimaryColumn({ type: 'text' })
  per_identificacion!: string;

  @Column({ type: 'boolean', nullable: true })
  registrado_en_renagro?: boolean;

  @Column({ type: 'boolean', nullable: true })
  registrado_en_infocampo?: boolean;

  @Column({ type: 'boolean', nullable: true })
  registrado_en_afc?: boolean;

  @Column({ type: 'text', nullable: true })
  fuentes_presentes?: string;

  @Column({ type: 'text', nullable: true })
  estado_cruce?: string;

  @Column({ type: 'boolean', nullable: true })
  tiene_duplicado?: boolean;

  @Column({ type: 'text', nullable: true })
  nombre_productor?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fecha_cruce?: Date;
}
