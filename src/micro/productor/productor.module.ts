import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductorService } from './services/productor.service';
import { ProductorController } from './controllers/productor.controller';
import { ConfigModule } from '@nestjs/config';
import { ConsultaProductoresRenagro } from './entities/consulta-productores-renagro.entity';
import { FichaProductorContacto } from './entities/ficha-productor-contacto.entity';
import { FichaProductorExtensionAgropecuaria } from './entities/ficha-productor-extension-agropecuaria.entity';
import { FichaProductorIdentificacion } from './entities/ficha-productor-identificacion.entity';
import { FichaProductorPecuario } from './entities/ficha-productor-pecuario.entity';
import { InteroperabilidadProductorComplementarias } from './entities/interoperabilidad-productor-complementarias.entity';
import { InteropProductorCultivo } from './entities/interop-productor-cultivo.entity';
import { InteropProductorResumenIntegral } from '../reportabilidad/entities/interop-productor-resumen-integral.entity';
import { ResumenAgricolaProductor } from './entities/resumen-agricola-productor.entity';
import { ResumenPecuarioProductor } from './entities/resumen-pecuario-productor.entity';

@Module({
  imports: [
    // Repositorios TypeORM que el ProductorService puede inyectar.
    // Cada entidad representa una vista/tabla de consulta read-only.
    TypeOrmModule.forFeature([
      FichaProductorContacto,
      ConsultaProductoresRenagro,
      FichaProductorIdentificacion,
      FichaProductorExtensionAgropecuaria,
      FichaProductorPecuario,
      InteroperabilidadProductorComplementarias,
      InteropProductorCultivo,
      InteropProductorResumenIntegral,
      ResumenAgricolaProductor,
      ResumenPecuarioProductor,
    ]),
    ConfigModule,
  ],
  // El servicio contiene las consultas y la composicion de respuestas.
  providers: [ProductorService],
  // El controlador expone las rutas HTTP bajo /micro-template/v1/productor.
  controllers: [ProductorController],
})
export class ProductorModule {}
