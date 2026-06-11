/**  EDITAR ESTE ARCHIVO PARA SER UTILIZADO EN EL DESPLIEGUE DE AMBIENTES EN GITLAB MAG */
module.exports = {
  apps: [
    {
      name: 'micro_interoperabilidad',
      exec_mode: 'cluster',
      instances: '2',
      script: './main.js',
      args: 'start',
      /**TODO: AMBIENTE DE DESARROLLO */
      env_des: {
        NODE_ENV: 'des',
        PORT_DEFAULT: 3055,
        NAME_PROYECT: 'micro_interoperabilidad',
        DETAIL_PROYECT:
          'Microservicio read-only de interoperabilidad RENAGRO sobre PostgreSQL',
        VERSION: 1.7,
        HOST_DATABASE: process.env.HOST_DATABASE || '<host_base_de_datos>',
        PORT_DATABASE: 5432,
        USER_DATABASE: process.env.USER_DATABASE || '<usuario_bd>',
        PASS_DATABASE: process.env.PASS_DATABASE || '<password_bd>',
        NAME_DATABASE: process.env.NAME_DATABASE || '<nombre_bd>',
        SCHEMA_DATABASE: 'sc_interop_renagro_magp',
        RETRYDELAY_DATABASE: 3000,
        RETRYATTEMPTS_DATABASE: 10,
        HOST_SWAGGER: 'http://localhost:3055',
        DETAIL_SWAGGER: 'Servidor de desarrollo',
        API_KEY: process.env.API_KEY || '<api_key>',
      },
      /**TODO: AMBIENTE DE PRUEBAS */
      env_test: {
        NODE_ENV: 'test',
        PORT_DEFAULT: 3055,
        NAME_PROYECT: 'micro_interoperabilidad',
        DETAIL_PROYECT:
          'Microservicio read-only de interoperabilidad RENAGRO sobre PostgreSQL',
        VERSION: 1.7,
        HOST_DATABASE: process.env.HOST_DATABASE || '<host_base_de_datos>',
        PORT_DATABASE: 5432,
        USER_DATABASE: process.env.USER_DATABASE || '<usuario_bd>',
        PASS_DATABASE: process.env.PASS_DATABASE || '<password_bd>',
        NAME_DATABASE: process.env.NAME_DATABASE || '<nombre_bd>',
        SCHEMA_DATABASE: 'sc_interop_renagro_magp',
        RETRYDELAY_DATABASE: 3000,
        RETRYATTEMPTS_DATABASE: 10,
        HOST_SWAGGER: 'http://localhost:3055',
        DETAIL_SWAGGER: 'Servidor de pruebas',
        API_KEY: process.env.API_KEY || '<api_key>',
      },
      /**AMBIENTE DE PRODUCCIÓN */
      env_prod: {
        NODE_ENV: 'prod',
        PORT_DEFAULT: 3055,
        NAME_PROYECT: 'micro_interoperabilidad',
        DETAIL_PROYECT:
          'Microservicio read-only de interoperabilidad RENAGRO sobre PostgreSQL',
        VERSION: 1.7,
        HOST_DATABASE: process.env.HOST_DATABASE || '<host_base_de_datos>',
        PORT_DATABASE: 5432,
        USER_DATABASE: process.env.USER_DATABASE || '<usuario_bd>',
        PASS_DATABASE: process.env.PASS_DATABASE || '<password_bd>',
        NAME_DATABASE: process.env.NAME_DATABASE || '<nombre_bd>',
        SCHEMA_DATABASE: 'sc_interop_renagro_magp',
        RETRYDELAY_DATABASE: 3000,
        RETRYATTEMPTS_DATABASE: 10,
        HOST_SWAGGER: 'http://localhost:3055',
        DETAIL_SWAGGER: 'Servidor de produccion',
        API_KEY: process.env.API_KEY || '<api_key>',
      },
    },
  ],
};
