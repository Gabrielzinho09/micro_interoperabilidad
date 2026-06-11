# Convenciones del proyecto

## Contexto del Proyecto

Este repositorio es el microservicio `micro_interoperabilidad` del Ministerio de Agricultura.

El microservicio expone APIs REST para consultar informacion interoperable ya homologada entre RENAGRO, AFC e INFOCAMPO.

La base/schema principal de consulta es:

- `sc_interop_renagro_magp`

El microservicio NO realiza ETL, NO homologa datos, NO modifica fuentes y NO debe crear migraciones destructivas.

## Regla Principal

Trabajar unicamente a nivel de consultas read-only.

Permitido:

- `GET`
- filtros
- paginacion
- Swagger/OpenAPI
- composicion de respuestas JSON
- KPIs con `COUNT`, `SUM`, `AVG`, agrupaciones y filtros

No permitido:

- `POST`, `PUT`, `PATCH`, `DELETE` para datos interoperables
- inserts, updates o deletes en base
- modificar tablas/vistas fuente
- cambiar nombres de vistas/tablas
- exponer credenciales
- usar `SELECT *` en consultas productivas

## Arquitectura Actual

El proyecto usa NestJS con TypeScript.

Patron actual:

- `module`
- `controller`
- `service`
- `entity`
- TypeORM repository
- Swagger con `@nestjs/swagger`
- seguridad por `X-API-KEY`
- paginacion con `nestjs-paginate`

Mantener este patron. No introducir arquitecturas nuevas salvo justificacion clara.

## Fuentes De Datos Prioritarias

Solo usar fuentes homologadas ya existentes en `sc_interop_renagro_magp`.

Vistas/tablas principales:

- `interop_productor_resumen_integral_v3`
- `interop_variables_complementarias_productor_v1`
- `resumen_agricola_productor_v1`
- `resumen_pecuario_productor_v2`
- `v_ficha_productor_identificacion_v1`
- `v_ficha_productor_extension_agropecuaria_v4`
- `v_ficha_productor_pecuario_v2`

Llave principal de cruce:

- `per_identificacion`

## Endpoints Esperados

Mantener o extender rutas bajo el patron actual:

- `/micro-template/v1/productor/findAll`
- `/micro-template/v1/productor/paginate/findAll`
- `/micro-template/v1/productor/{perIdentificacion}`
- `/micro-template/v1/productor/identificacion/{cedula}`
- `/micro-template/v1/productor/identificacion/{cedula}/ficha`
- `/micro-template/v1/productor/{perIdentificacion}/agricola`
- `/micro-template/v1/productor/{perIdentificacion}/pecuario`
- `/micro-template/v1/productor/{perIdentificacion}/extension`
- `/micro-template/v1/productor/{perIdentificacion}/complementarias`
- `/micro-template/v1/reportabilidad/kpis`

## KPIs Permitidos

Calcular KPIs desde vistas consolidadas:

- total productores interoperables
- productores por fuente
- productores por `total_fuentes`
- productores por `estado_interoperabilidad_productor`
- productores por `nivel_interoperabilidad_integral`
- productores con INFOCAMPO
- productores con AFC
- productores con RENAGRO
- coincidencia territorial
- resumen agricola
- cultivos homologados
- cultivos pendientes
- cultivos sin equivalencia
- superficie total
- resumen pecuario
- asociacion
- riego
- extension agropecuaria

## Seguridad Y Calidad

- No exponer credenciales.
- Validar parametros de entrada.
- Usar DTOs para filtros.
- Documentar Swagger.
- Usar `NotFoundException`, `BadRequestException` y errores HTTP controlados.
- Declarar entidades TypeORM read-only sobre vistas.
- Para vistas sin ID numerico usar `@PrimaryColumn()` sobre `per_identificacion`.

