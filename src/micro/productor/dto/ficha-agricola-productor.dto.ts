import { InteropProductorCultivo } from '../entities/interop-productor-cultivo.entity';
import { ResumenAgricolaProductor } from '../entities/resumen-agricola-productor.entity';

export class FichaAgricolaProductorDto {
  resumen!: ResumenAgricolaProductor | null;
  cultivos!: InteropProductorCultivo[];
}
