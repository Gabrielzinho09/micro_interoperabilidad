# Guía de Tipos de Commits para el Proyecto

Esta guía define los tipos de mensajes de commit aceptados en el equipo para mantener un historial limpio, entendible y fácil de revisar.

## Estructura del mensaje

```bash
<tipo>(módulo): <mensaje en infinitivo>
```

Ejemplo:

```bash
git commit -m "feat(header): agregar buscador en el header"
```

## Tipos de Commit Permitidos

| Tipo            | Descripción                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| `feat`          | Nueva funcionalidad                                                         |
| `fix`           | Corrección de errores                                                       |
| `docs`          | Cambios en documentación                                                    |
| `style`         | Cambios que no afectan el código (formato, espacios, comas, etc.)           |
| `refactor`      | Reestructuración de código sin cambiar funcionalidad                        |
| `test`          | Agregar o modificar pruebas (unitarias, integradas, etc.)                   |
| `chore`         | Tareas menores que no afectan el código de la app (configs, scripts, etc.)  |
| `perf`          | Mejoras de rendimiento                                                      |
| `ci`            | Cambios en integración continua (GitHub Actions, Jenkins, etc.)             |
| `build`         | Cambios en el sistema de build o dependencias externas                      |
| `revert`        | Reversión de un commit anterior                                             |
| `env`           | Cambios en archivos de entorno (.env, variables de entorno)                 |
| `i18n`          | Cambios en internacionalización o traducciones                              |
| `deps`          | Cambios en dependencias (instalar, actualizar, eliminar)                    |
| `ux`            | Mejoras en la experiencia de usuario                                        |
| `accessibility` | Mejoras en accesibilidad (uso de aria-labels, navegación con teclado, etc.) |

## Buenas prácticas

* Usa siempre el infinitivo en el mensaje (ej: "agregar", "corregir").
* Usa minúsculas, sin punto final.
* Sé claro y específico.
* Incluye el módulo entre paréntesis si aplica (ej: `(header)`, `(auth)`).
* Si haces varios cambios no relacionados, separa en commits distintos.

## Ejemplos válidos

```bash
git commit -m "feat(productos): agregar botón para favoritos"
git commit -m "fix(carrito): corregir error al aplicar descuentos"
git commit -m "docs(readme): actualizar instrucciones de despliegue"
git commit -m "style(ui): aplicar formato con prettier"
git commit -m "test(auth): agregar prueba unitaria para login"
git commit -m "perf(listado): optimizar renderizado con virtual scroll"
git commit -m "ci(github): agregar workflow para tests"
git commit -m "env: agregar nueva variable de entorno para API"
```

---

Este archivo puede compartirse con todo el equipo, incluirse en el repositorio como `COMMIT_TYPES.md` o integrarse con herramientas como `commitlint` para validarlo automáticamente.
