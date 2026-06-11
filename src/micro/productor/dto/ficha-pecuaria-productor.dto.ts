import { FichaProductorPecuario } from '../entities/ficha-productor-pecuario.entity';
import { ResumenPecuarioProductor } from '../entities/resumen-pecuario-productor.entity';

export class FichaPecuariaProductorDto {
  ficha!: FichaProductorPecuario | null;
  resumen!: ResumenPecuarioProductor | null;
}
