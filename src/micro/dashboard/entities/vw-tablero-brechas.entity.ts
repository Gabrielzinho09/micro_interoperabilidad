import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_tablero_brechas',
})
export class VwTableroBrechas {
  @PrimaryColumn({ type: 'text' })
  tipo_brecha!: string;

  @Column({ type: 'bigint' })
  total!: string;
}
