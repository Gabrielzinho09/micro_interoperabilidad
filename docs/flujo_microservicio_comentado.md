# Flujo comentado del microservicio

Este microservicio es una API REST NestJS de consulta read-only sobre datos ya
homologados de interoperabilidad RENAGRO, INFOCAMPO y AFC. No ejecuta ETL y no
modifica las fuentes: solo valida la peticion, consulta PostgreSQL y devuelve
JSON para el frontend o para otros consumidores.

## 1. Arranque de la aplicacion

Archivo: `src/main.ts`

1. `bootstrap()` crea la aplicacion Nest con `AppModule`.
2. Habilita CORS para permitir consumo desde el frontend.
3. Activa `ValidationPipe` global para validar parametros/DTOs cuando existan.
4. Lee variables de entorno como nombre del proyecto, version, Swagger y puerto.
5. Configura Swagger y documenta el header `X-API-KEY`.
6. Levanta el servidor HTTP en `PORT_DEFAULT`.

## 2. Configuracion global

Archivo: `src/app.module.ts`

1. `ConfigModule` carga variables desde `.des.env`.
2. `TypeOrmModule.forRoot()` abre la conexion PostgreSQL.
3. `synchronize: false` evita que TypeORM cree o altere estructuras.
4. Las entidades registradas mapean vistas/tablas del esquema
   `sc_interop_renagro_magp`.
5. Se registran los modulos funcionales:
   `ProductorModule`, `ReportabilidadModule`, `DashboardModule` y `HealthModule`.
6. Se registra `HeaderApiKeyStrategy` para validar `X-API-KEY`.
7. Se registra `HttpExceptionFilter` para normalizar errores HTTP.

## 3. Seguridad

Archivo: `src/utils/apiKey.strategy.ts`

1. Los controladores protegidos usan `@UseGuards(AuthGuard('api-key'))`.
2. Passport ejecuta `HeaderApiKeyStrategy.authenticate()`.
3. El servicio lee el header `X-API-KEY`.
4. Lo compara contra la variable de entorno `API_KEY`.
5. Si coincide, la request continua; si no coincide, responde `401`.

## 4. Flujo de Productor

Archivos:

- `src/micro/productor/productor.module.ts`
- `src/micro/productor/controllers/productor.controller.ts`
- `src/micro/productor/services/productor.service.ts`
- `src/micro/productor/entities/*.ts`

Flujo:

1. El cliente llama una ruta bajo `/micro-template/v1/productor`.
2. El guard valida `X-API-KEY`.
3. `ProductorController` recibe parametros o query params.
4. El controlador delega en `ProductorService`.
5. El servicio valida identificaciones con `validateIdentificacion()`.
6. El servicio consulta vistas con repositorios TypeORM o SQL parametrizado.
7. La respuesta vuelve como JSON.

Endpoints principales:

- `GET /findAll`: listado simple limitado.
- `GET /paginate/findAll`: listado paginado con filtros.
- `GET /identificacion/:cedula`: bloque base de identificacion.
- `GET /identificacion/:cedula/ficha`: ficha integrada.
- `GET /:perIdentificacion/contacto`: contactos.
- `GET /:perIdentificacion/agricola`: resumen y cultivos.
- `GET /:perIdentificacion/pecuario`: ficha y resumen pecuario.
- `GET /:perIdentificacion/extension`: extension agropecuaria.
- `GET /:perIdentificacion/complementarias`: variables complementarias.
- `GET /:perIdentificacion/trazabilidad`: trazabilidad si la vista existe.
- `GET /tablero-*`: tableros agregados por modulo.

Regla importante:

Por defecto el listado trabaja con el universo RENAGRO. Los productores externos
sin RENAGRO solo se incluyen si se solicita explicitamente con el parametro
`incluirExternos`.

## 5. Ficha integrada

Archivo: `src/micro/productor/services/productor.service.ts`

1. `findFichaIntegrada()` llama primero a `findByIdentificacion()`.
2. Si el productor no existe, lanza `NotFoundException`.
3. Si existe, consulta en paralelo:
   identificacion, contacto, ubicacion, resumen productivo, agricola, pecuario,
   extension, complementarias y trazabilidad.
4. Devuelve un objeto compuesto `FichaProductorIntegradaDto`.

Forma general:

```json
{
  "identificacion": {},
  "contacto": [],
  "ubicacion": {},
  "resumenProductivo": {},
  "agricola": {
    "resumen": {},
    "cultivos": []
  },
  "pecuario": {
    "ficha": {},
    "resumen": {}
  },
  "extension": {},
  "complementarias": {},
  "trazabilidad": {}
}
```

## 6. Flujo de Reportabilidad

Archivos:

- `src/micro/reportabilidad/controllers/reportabilidad.controller.ts`
- `src/micro/reportabilidad/services/reportabilidad.service.ts`

Flujo:

1. El cliente llama `/micro-template/v1/reportabilidad/kpis`.
2. El guard valida `X-API-KEY`.
3. El controlador delega en `ReportabilidadService`.
4. El servicio ejecuta una agregacion SQL read-only sobre
   `sc_interop_renagro_magp.vw_tablero_interop_productores`.
5. Devuelve totales de RENAGRO, cruces con AFC/INFOCAMPO y porcentaje de
   enriquecimiento.

## 7. Flujo de Dashboard

Archivos:

- `src/micro/dashboard/controllers/dashboard.controller.ts`
- `src/micro/dashboard/services/dashboard.service.ts`
- `src/micro/dashboard/entities/*.ts`

Endpoints:

- `GET /micro-template/v1/dashboard/kpis`
- `GET /micro-template/v1/dashboard/fuentes`
- `GET /micro-template/v1/dashboard/estados`
- `GET /micro-template/v1/dashboard/etl-jobs`
- `GET /micro-template/v1/dashboard/enriquecimiento`
- `GET /micro-template/v1/dashboard/mapa/provincias`

El servicio combina repositorios TypeORM y SQL directo para leer vistas finales,
bitacora ETL, brechas, conflictos y metricas territoriales. La salida ya viene
adaptada al contrato esperado por el frontend.

## 8. Health check

Archivo: `src/system/health/controllers/health.controller.ts`

Endpoint:

```text
GET /micro/health/status
```

Valida dos cosas:

1. Que la URL de Swagger configurada responda.
2. Que la conexion PostgreSQL acepte ping.

Tambien esta protegido con `X-API-KEY`.

## 9. Resumen corto del flujo

```text
Cliente
  -> HTTP GET + X-API-KEY
  -> Controller
  -> Service
  -> TypeORM Repository o DataSource SQL
  -> PostgreSQL / vistas sc_interop_renagro_magp
  -> JSON de respuesta
```

