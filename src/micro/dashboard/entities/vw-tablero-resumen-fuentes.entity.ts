import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_tablero_resumen_fuentes',
})
export class VwTableroResumenFuentes {
  @PrimaryColumn({ type: 'text' })
  metrica!: string;

  @Column({ type: 'bigint' })
  total!: string;
}
