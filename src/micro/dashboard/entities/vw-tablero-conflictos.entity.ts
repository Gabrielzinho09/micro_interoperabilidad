import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  schema: 'sc_interop_renagro_magp',
  name: 'vw_tablero_conflictos',
})
export class VwTableroConflictos {
  @PrimaryColumn({ type: 'text' })
  modulo!: string;

  @PrimaryColumn({ type: 'text' })
  campo_negocio!: string;

  @PrimaryColumn({ type: 'text' })
  tipo_conflicto!: string;

  @Column({ type: 'bigint' })
  total!: string;
}
