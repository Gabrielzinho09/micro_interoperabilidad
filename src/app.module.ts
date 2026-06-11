import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConsultaProductoresRenagro } from './micro/productor/entities/consulta-productores-renagro.entity';
import { FichaProductorContacto } from './micro/productor/entities/ficha-productor-contacto.entity';
import { FichaProductorExtensionAgropecuaria } from './micro/productor/entities/ficha-productor-extension-agropecuaria.entity';
import { FichaProductorIdentificacion } from './micro/productor/entities/ficha-productor-identificacion.entity';
import { FichaProductorPecuario } from './micro/productor/entities/ficha-productor-pecuario.entity';
import { InteroperabilidadProductorComplementarias } from './micro/productor/entities/interoperabilidad-productor-complementarias.entity';
import { InteropProductorResumenIntegral } from './micro/reportabilidad/entities/interop-productor-resumen-integral.entity';
import { InteropProductorCultivo } from './micro/productor/entities/interop-productor-cultivo.entity';
import { ProductorModule } from './micro/productor/productor.module';
import { ReportabilidadModule } from './micro/reportabilidad/reportabilidad.module';
import { ResumenAgricolaProductor } from './micro/productor/entities/resumen-agricola-productor.entity';
import { ResumenPecuarioProductor } from './micro/productor/entities/resumen-pecuario-productor.entity';
import { DashboardModule } from './micro/dashboard/dashboard.module';
import { BitacoraInteropEjecucion } from './micro/dashboard/entities/bitacora-interop-ejecucion.entity';
import { VwDashboardProductores } from './micro/dashboard/entities/vw-dashboard-productores.entity';
import { VwTableroBrechas } from './micro/dashboard/entities/vw-tablero-brechas.entity';
import { VwTableroConflictos } from './micro/dashboard/entities/vw-tablero-conflictos.entity';
import { VwTableroMetricasEtl } from './micro/dashboard/entities/vw-tablero-metricas-etl.entity';
import { VwTableroResumenFuentes } from './micro/dashboard/entities/vw-tablero-resumen-fuentes.entity';
import { HttpExceptionFilter } from './utils/http-exception.filter';
import { HeaderApiKeyStrategy } from './utils/apiKey.strategy';
import { HealthModule } from './system/health/health.module';

@Module({
  imports: [
    // Carga variables de entorno para toda la aplicacion.
    // En este proyecto se usa .des.env como archivo base local.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.des.env',
    }),
    // Conexion principal a PostgreSQL. synchronize=false evita que TypeORM
    // intente modificar tablas/vistas; el microservicio trabaja read-only.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST_DATABASE,
      port: Number(process.env.PORT_DATABASE),
      username: process.env.USER_DATABASE,
      password: process.env.PASS_DATABASE,
      database: process.env.NAME_DATABASE,
      schema: process.env.SCHEMA_DATABASE,
      // Entidades que mapean vistas/tablas de interoperabilidad.
      // TypeORM las usa para consultas tipadas desde los servicios.
      entities: [
        ConsultaProductoresRenagro,
        FichaProductorContacto,
        FichaProductorIdentificacion,
        FichaProductorExtensionAgropecuaria,
        FichaProductorPecuario,
        InteroperabilidadProductorComplementarias,
        InteropProductorCultivo,
        InteropProductorResumenIntegral,
        ResumenAgricolaProductor,
        ResumenPecuarioProductor,
        VwDashboardProductores,
        VwTableroResumenFuentes,
        VwTableroMetricasEtl,
        VwTableroBrechas,
        VwTableroConflictos,
        BitacoraInteropEjecucion,
      ],
      synchronize: false,
      retryDelay: Number(process.env.RETRYDELAY_DATABASE),
      retryAttempts: Number(process.env.RETRYATTEMPTS_DATABASE),
    }),
    // Modulos funcionales publicados por la API REST.
    ProductorModule,
    ReportabilidadModule,
    DashboardModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    // Estrategia Passport que valida el header X-API-KEY.
    HeaderApiKeyStrategy,
    {
      // Filtro global para normalizar errores HTTP.
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
