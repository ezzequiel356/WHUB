#!/bin/bash
# Crea el usuario que va a usar el backend (whub_app) con permisos mínimos:
# solo EXECUTE sobre cada procedure (no puede ver el cuerpo con SHOW CREATE
# PROCEDURE ni via information_schema.ROUTINES) y SELECT puntual sobre las
# dos tablas que se consultan directo sin pasar por un procedure
# (GET /api/usuarios/:username en auth.js). Nunca root, nunca DEFINER.
set -euo pipefail

if [ -z "${DB_APP_PASSWORD:-}" ]; then
  echo "ERROR: falta la variable de entorno DB_APP_PASSWORD" >&2
  exit 1
fi

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
  CREATE USER IF NOT EXISTS 'whub_app'@'%' IDENTIFIED BY '${DB_APP_PASSWORD}';

  GRANT EXECUTE ON PROCEDURE warframe.sp_cambiar_username     TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_cambiar_contraseña   TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_cambiar_nombre       TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_cambiar_apellido     TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_cambiar_avatar       TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_cambiar_banner       TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_cambiar_descripcion  TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_cambiar_email        TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_registrar_usuario    TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_login                TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_buscar_usuario       TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_agregar_favorito     TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_eliminar_favorito    TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_obtener_favoritos    TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_guardar_compra       TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_eliminar_compra      TO 'whub_app'@'%';
  GRANT EXECUTE ON PROCEDURE warframe.sp_obtener_compras      TO 'whub_app'@'%';

  -- GET /api/usuarios/:username hace un SELECT directo (no pasa por un SP)
  GRANT SELECT ON warframe.usuarios TO 'whub_app'@'%';
  GRANT SELECT ON warframe.perfil   TO 'whub_app'@'%';

  FLUSH PRIVILEGES;
EOSQL

echo "Usuario whub_app creado con permisos EXECUTE-only sobre los procedures."
