import { FichaAgricolaProductorDto } from './ficha-agricola-productor.dto';
import { FichaPecuariaProductorDto } from './ficha-pecuaria-productor.dto';
import { FichaProductorContacto } from '../entities/ficha-productor-contacto.entity';
import { FichaProductorExtensionAgropecuaria } from '../entities/ficha-productor-extension-agropecuaria.entity';
import { FichaProductorIdentificacion } from '../entities/ficha-productor-identificacion.entity';
import { InteroperabilidadProductorComplementarias } from '../entities/interoperabilidad-productor-complementarias.entity';
import { InteropProductorResumenIntegral } from '../../reportabilidad/entities/interop-productor-resumen-integral.entity';

export class FichaProductorIntegradaDto {
  identificacion!: FichaProductorIdentificacion;
  contacto!: FichaProductorContacto[];
  ubicacion!: Record<string, unknown> | null;
  resumenProductivo!: InteropProductorResumenIntegral | null;
  agricola!: FichaAgricolaProductorDto;
  pecuario!: FichaPecuariaProductorDto;
  extension?: FichaProductorExtensionAgropecuaria | null;
  complementarias?: InteroperabilidadProductorComplementarias | null;
  trazabilidad!: Record<string, unknown> | null;
}
