import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { BitacoraInteropEjecucion } from './entities/bitacora-interop-ejecucion.entity';
import { VwDashboardProductores } from './entities/vw-dashboard-productores.entity';
import { VwTableroBrechas } from './entities/vw-tablero-brechas.entity';
import { VwTableroConflictos } from './entities/vw-tablero-conflictos.entity';

import { VwTableroResumenFuentes } from './entities/vw-tablero-resumen-fuentes.entity';

@Module({
  imports: [
    // Vistas/tablas necesarias para los endpoints del dashboard ejecutivo.
    TypeOrmModule.forFeature([
      VwDashboardProductores,
      VwTableroResumenFuentes,
      VwTableroBrechas,
      VwTableroConflictos,
      BitacoraInteropEjecucion,
    ]),
  ],
  // Rutas REST del dashboard y servicio con consultas/agregaciones.
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
