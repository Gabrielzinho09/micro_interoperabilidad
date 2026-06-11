# micro_interoperabilidad

Microservicio **NestJS read-only** que expone APIs REST de consulta sobre
informacion interoperable de productores ya homologada entre **RENAGRO, AFC e
INFOCAMPO**, sobre PostgreSQL. No ejecuta ETL ni logica de negocio: solo
consultas, fichas consolidadas y KPIs.

> Documentacion complementaria: [`CONVENCIONES.md`](./CONVENCIONES.md) (reglas y
> endpoints) y [`docs/`](./docs) (flujo del microservicio comentado).

## Requisitos previos

- **Node.js 22.11.0 LTS** (imprescindible esta version) y **npm 11**.
- Acceso de red a la base de datos **PostgreSQL** del MAG y sus credenciales.
- El `API_KEY` del header `X-API-KEY` (lo entrega el equipo MAG).

## Clonar y arrancar en local

```bash
# 1. Clonar
git clone <URL_DEL_REPOSITORIO> micro_interoperabilidad
cd micro_interoperabilidad

# 2. Crear el archivo de entorno local a partir de la plantilla
cp .des.env.example .des.env
#   Windows PowerShell: Copy-Item .des.env.example .des.env

# 3. Editar .des.env y completar credenciales de BD y API_KEY

# 4. Instalar dependencias
npm install

# 5. Levantar en modo desarrollo (watch)
npm run start:dev
```

Swagger queda en: http://localhost:3055/micro_interoperabilidad/

> `.des.env` esta en `.gitignore`: contiene credenciales y **no se versiona**.
> Solo se versiona la plantilla `.des.env.example`.

## Variables de entorno

Definidas en `.des.env` (local) y en `src/ecosystem.config.js` (servidores PM2).

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `NODE_ENV` | Ambiente de ejecucion | `des` / `test` / `prod` |
| `PORT_DEFAULT` | Puerto HTTP del micro | `3055` |
| `NAME_PROYECT` | Nombre del proyecto (ruta Swagger) | `micro_interoperabilidad` |
| `DETAIL_PROYECT` | Descripcion mostrada en Swagger | — |
| `VERSION` | Version expuesta en Swagger | `1.7` |
| `HOST_DATABASE` | Host de PostgreSQL | `10.10.1.x` |
| `PORT_DATABASE` | Puerto de PostgreSQL | `5432` |
| `USER_DATABASE` | Usuario de BD (read-only) | — |
| `PASS_DATABASE` | Password de BD | — |
| `NAME_DATABASE` | Nombre de la base | — |
| `SCHEMA_DATABASE` | Esquema oficial | `sc_interop_renagro_magp` |
| `RETRYDELAY_DATABASE` | Reintento de conexion (ms) | `3000` |
| `RETRYATTEMPTS_DATABASE` | Numero de reintentos | `10` |
| `HOST_SWAGGER` | URL base mostrada en Swagger | `http://localhost:3055` |
| `DETAIL_SWAGGER` | Etiqueta del servidor en Swagger | `Servidor de desarrollo` |
| `API_KEY` | Token del header `X-API-KEY` | — (privado) |

---

## Convenciones RENAGRO (obligatorias)

- Esquema oficial activo: `sc_interop_renagro_magp`.
- No usar `sc_interop_renagro_mag` ni variantes con typo.
- Este microservicio hace CRUD y acceso a datos; no implementa logica de negocio.
- Cualquier referencia de schema en `.env`, entities o queries raw debe apuntar a `sc_interop_renagro_magp`.
- Regla rectora: sin RENAGRO no existe productor interoperado.
- El frontend no llama este micro directamente; el acceso es a traves del API.
- Si una transformacion combina fuentes o aplica reglas de negocio, debe vivir en el API, no aqui.
- Para dashboard exponer/consumir solo vistas `vw_*`; evitar `stg_*`, `val_*`, `rej_*`, `pend_*`.
- Antes de definir tipos en entities, validar tipos reales en `information_schema.columns`.
- Para cambios de esquema, documentar evidencia de validacion con administracion BDD en `docs/`.

## Microservicio

```bash
Definciión: Esta API permite conectarse a una base de datos PostgreSQL y crear CRUD's de cada tabla.
* Nota: No incluir en este componente lógica de negocio.
```

## Nombre del proyecto

```bash
Nombre: micro_interoperabilidad (Siempre incluir guión inferior ' _ ' para nombrar el proyecto)
```

```bash
ANTES DE INCIIAR: busca micro_interoperabilidad y reemplaza con el nombre de tu proyect, por ejemplo micro_productor
```

## Información técnica

```bash
Puerto: 3055 (PORT_DEFAULT, definido en .des.env y src/ecosystem.config.js)
NodeJS: 22.11.0 LTS ¡Importante trabajar con esta versión!
NestJS: 11.4.4 o superior
Versión 1.7
npm: 11.0.0
Seguridad: API KEY
```

## Nomenclatura

```bash
Nombre endpoints: findByIdAppAndIdPer
@Controller('') : Siempre incluir nombres con guion central (@Controller('micro-productor'))
Variables globales: Definirlas en Mayusculas con guión bajo (NAME_DATABASE)
Nombre del proyecto: Definirlas con guión bajo (micro_interoperabilidad)
Nombre de funciones y variables utilizar lowerCamelCase.
```

## Status Code

```bash
200: Use para respuestas exitosas de consultas (GET)
201: Use para respuestas exitosas de creación (POST)
400: Use para errores de validación del cliente
401: Use cuando faltan credenciales o son inválidas
403: Use cuando hay credenciales válidas pero sin permisos
404: Use cuando el recurso solicitado no existe
409: Use cuando hay conflictos de datos (ej: duplicados)
500: Use para errores internos inesperados
502: Use para errores de comunicación entre servicios
503: Use cuando el servicio está temporalmente caído
```

## Iniciar un proyecto

```bash
$ npm install
```

## Correr servicios en local

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

## run in Production PM2
$ npm run build

## Test

# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Archivos importantes

```bash
.des.env : Variables globales para desarrollar localmente.
ecosystem.config.js : Variables globales para servidores de pruebas y producción MAG.
micro/health : Controla el estatus del micro y de su base de datos.
```

## Deploy in the server MAG PM2

```bash
# Editar el archivo de variables de entorno para cada ambiente (despliegue automático)
Editar el archivo:  ecosystem.config.js

# desarrollo
pm2 startOrRestart ecosystem.config.js --env des
# pruebas
pm2 startOrRestart ecosystem.config.js --env test
# producción
pm2 startOrRestart ecosystem.config.js --env prod
```

## Abrir Swagger en el explorador web local

```bash
http://localhost:3055/micro_interoperabilidad/

```

## Abrir Swagger en el explorador web server (Desarrollo)

```bash
http://10.10.1.243:3055/micro_interoperabilidad/

```

## Token para probar este servicio

El `API_KEY` se entrega de forma privada por el equipo MAG. Colocalo en tu
`.des.env` local (variable `API_KEY`) y enancalo en Swagger con el boton
**Authorize** usando el header `X-API-KEY`. No se versiona ningun token real.

## Procedimiento para poner el servicios en producción

```bash
1.- Verificar y llenar el archivo ecosystem.config.js en el aparto "env_production".
2.- Verificar que exista un puerta entre 3010-3099.
3.- Realizar merge a la rama master.
```

## Support

- Plantilla desarrollada para el Ministerio de Agricultura basada en Typscript con el framewrok Nestjs 11.

## Author

- [Carlos Burgos C.]

## License

- Ministerio de Agricultura - 2025
