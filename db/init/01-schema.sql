-- Schema de warframe para el contenedor de MySQL.
-- Versión consolidada de DB.txt: solo el estado final de cada tabla y cada
-- procedure (sin las versiones viejas superadas ni los CALL de ejemplo
-- ejecutables que tiene el DB.txt original). MySQL corre este archivo
-- automáticamente la primera vez que el contenedor arranca con el volumen
-- de datos vacío.

CREATE SCHEMA IF NOT EXISTS warframe DEFAULT CHARACTER SET utf8mb4;
USE warframe;

-- -----------------------------------------------------
-- Tablas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS perfil (
  id_perfil INT NOT NULL AUTO_INCREMENT,
  avatar VARCHAR(255),
  banner VARCHAR(255),
  descripcion TEXT,
  PRIMARY KEY (id_perfil)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NOT NULL,
  apellido VARCHAR(45) NOT NULL,
  username VARCHAR(45) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  perfil_id_perfil INT NOT NULL UNIQUE,
  PRIMARY KEY (id_usuario),
  INDEX fk_usuarios_perfil_idx (perfil_id_perfil),
  CONSTRAINT fk_usuarios_perfil
    FOREIGN KEY (perfil_id_perfil)
    REFERENCES perfil (id_perfil)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS favoritos (
  id_favorito     INT NOT NULL AUTO_INCREMENT,
  id_usuario      INT NOT NULL,
  warframe_nombre VARCHAR(100) NOT NULL,
  fecha_agregado  DATETIME DEFAULT NOW(),
  PRIMARY KEY (id_favorito),
  UNIQUE KEY uq_usuario_warframe (id_usuario, warframe_nombre),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS compras_guardadas (
  id_compra       INT NOT NULL AUTO_INCREMENT,
  id_usuario      INT NOT NULL,
  item_nombre     VARCHAR(255) NOT NULL,
  item_url_nombre VARCHAR(255) NOT NULL,
  vendedor        VARCHAR(100),
  precio_platinum INT,
  estado_vendedor VARCHAR(50),
  fecha_guardado  DATETIME DEFAULT NOW(),
  PRIMARY KEY (id_compra),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Procedures
-- -----------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_cambiar_username(
    IN p_id_usuario INT,
    IN p_nuevo_username VARCHAR(45)
)
BEGIN
    IF p_nuevo_username = '' OR p_nuevo_username IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el username no puede estar vacío.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el usuario no existe.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM usuarios
        WHERE username = p_nuevo_username
          AND id_usuario <> p_id_usuario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: ese username ya está en uso.';
    END IF;

    UPDATE usuarios
    SET username = p_nuevo_username
    WHERE id_usuario = p_id_usuario;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_cambiar_contraseña(
    IN p_id_usuario        INT,
    IN p_contraseña_actual VARCHAR(255),
    IN p_contraseña_nueva  VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM usuarios
        WHERE id_usuario = p_id_usuario
          AND contraseña = p_contraseña_actual
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: la contraseña actual es incorrecta.';
    END IF;

    IF p_contraseña_nueva = '' OR p_contraseña_nueva IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: la nueva contraseña no puede estar vacía.';
    END IF;

    IF p_contraseña_nueva = p_contraseña_actual THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: la nueva contraseña debe ser diferente a la actual.';
    END IF;

    UPDATE usuarios
    SET contraseña = p_contraseña_nueva
    WHERE id_usuario = p_id_usuario;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_cambiar_nombre(
    IN p_id_usuario   INT,
    IN p_nuevo_nombre VARCHAR(45)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el usuario no existe.';
    END IF;

    IF p_nuevo_nombre = '' OR p_nuevo_nombre IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el nombre no puede estar vacío.';
    END IF;

    UPDATE usuarios
    SET nombre = p_nuevo_nombre
    WHERE id_usuario = p_id_usuario;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_cambiar_apellido(
    IN p_id_usuario     INT,
    IN p_nuevo_apellido VARCHAR(45)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el usuario no existe.';
    END IF;

    IF p_nuevo_apellido = '' OR p_nuevo_apellido IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el apellido no puede estar vacío.';
    END IF;

    UPDATE usuarios
    SET apellido = p_nuevo_apellido
    WHERE id_usuario = p_id_usuario;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_cambiar_avatar(
    IN p_id_usuario   INT,
    IN p_nuevo_avatar VARCHAR(255)
)
BEGIN
    DECLARE v_perfil_id INT;

    SELECT perfil_id_perfil INTO v_perfil_id
    FROM usuarios WHERE id_usuario = p_id_usuario;

    IF v_perfil_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: no se encontró perfil para ese usuario.';
    END IF;

    UPDATE perfil
    SET avatar = p_nuevo_avatar
    WHERE id_perfil = v_perfil_id;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_cambiar_banner(
    IN p_id_usuario   INT,
    IN p_nuevo_banner VARCHAR(255)
)
BEGIN
    DECLARE v_perfil_id INT;

    SELECT perfil_id_perfil INTO v_perfil_id
    FROM usuarios WHERE id_usuario = p_id_usuario;

    IF v_perfil_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: no se encontró perfil para ese usuario.';
    END IF;

    UPDATE perfil
    SET banner = p_nuevo_banner
    WHERE id_perfil = v_perfil_id;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_cambiar_descripcion(
    IN p_id_usuario        INT,
    IN p_nueva_descripcion TEXT
)
BEGIN
    DECLARE v_perfil_id INT;

    SELECT perfil_id_perfil INTO v_perfil_id
    FROM usuarios WHERE id_usuario = p_id_usuario;

    IF v_perfil_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: no se encontró perfil para ese usuario.';
    END IF;

    UPDATE perfil
    SET descripcion = p_nueva_descripcion
    WHERE id_perfil = v_perfil_id;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_cambiar_email(
    IN p_id_usuario INT,
    IN p_nuevo_email VARCHAR(100)
)
BEGIN
    IF p_nuevo_email = '' OR p_nuevo_email IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el email no puede estar vacío.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el usuario no existe.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM usuarios
        WHERE email = p_nuevo_email
          AND id_usuario <> p_id_usuario
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: ese email ya está en uso.';
    END IF;

    UPDATE usuarios
    SET email = p_nuevo_email
    WHERE id_usuario = p_id_usuario;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_registrar_usuario(
    IN p_nombre     VARCHAR(45),
    IN p_apellido   VARCHAR(45),
    IN p_username   VARCHAR(45),
    IN p_email      VARCHAR(100),
    IN p_contraseña VARCHAR(255)
)
BEGIN
    DECLARE v_perfil_id INT;

    IF p_nombre = '' OR p_nombre IS NULL OR
       p_apellido = '' OR p_apellido IS NULL OR
       p_username = '' OR p_username IS NULL OR
       p_email = '' OR p_email IS NULL OR
       p_contraseña = '' OR p_contraseña IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: todos los campos son obligatorios.';
    END IF;

    IF EXISTS (SELECT 1 FROM usuarios WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: ese username ya está en uso.';
    END IF;

    IF EXISTS (SELECT 1 FROM usuarios WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: ese email ya está registrado.';
    END IF;

    START TRANSACTION;

        INSERT INTO perfil (avatar, banner, descripcion)
        VALUES (NULL, NULL, NULL);

        SET v_perfil_id = LAST_INSERT_ID();

        INSERT INTO usuarios (nombre, apellido, username, email, contraseña, perfil_id_perfil)
        VALUES (p_nombre, p_apellido, p_username, p_email, p_contraseña, v_perfil_id);

    COMMIT;

    SELECT LAST_INSERT_ID() AS id_usuario_creado, v_perfil_id AS id_perfil_creado;
END$$

CREATE PROCEDURE sp_login(
    IN p_username   VARCHAR(45),
    IN p_contraseña VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM usuarios
        WHERE username = p_username
          AND contraseña = p_contraseña
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: usuario o contraseña incorrectos.';
    END IF;

    SELECT
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.username,
        u.email,
        p.id_perfil,
        p.avatar,
        p.banner,
        p.descripcion
    FROM usuarios u
    INNER JOIN perfil p ON u.perfil_id_perfil = p.id_perfil
    WHERE u.username = p_username
      AND u.contraseña = p_contraseña;
END$$

CREATE PROCEDURE sp_buscar_usuario(
    IN p_busqueda VARCHAR(45)
)
BEGIN
    IF p_busqueda = '' OR p_busqueda IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: ingresá un término de búsqueda.';
    END IF;

    SELECT
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.username,
        p.avatar,
        p.descripcion
    FROM usuarios u
    INNER JOIN perfil p ON u.perfil_id_perfil = p.id_perfil
    WHERE u.username LIKE CONCAT('%', p_busqueda, '%')
       OR u.nombre   LIKE CONCAT('%', p_busqueda, '%')
       OR u.apellido LIKE CONCAT('%', p_busqueda, '%');
END$$

CREATE PROCEDURE sp_agregar_favorito(
    IN p_id_usuario      INT,
    IN p_warframe_nombre VARCHAR(100)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el usuario no existe.';
    END IF;

    IF p_warframe_nombre = '' OR p_warframe_nombre IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el nombre del warframe no puede estar vacío.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM favoritos
        WHERE id_usuario = p_id_usuario
          AND warframe_nombre = p_warframe_nombre
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: ese warframe ya está en favoritos.';
    END IF;

    INSERT INTO favoritos (id_usuario, warframe_nombre)
    VALUES (p_id_usuario, p_warframe_nombre);

    SELECT LAST_INSERT_ID() AS id_favorito_creado;
END$$

CREATE PROCEDURE sp_eliminar_favorito(
    IN p_id_usuario      INT,
    IN p_warframe_nombre VARCHAR(100)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM favoritos
        WHERE id_usuario = p_id_usuario
          AND warframe_nombre = p_warframe_nombre
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: ese warframe no está en favoritos.';
    END IF;

    DELETE FROM favoritos
    WHERE id_usuario = p_id_usuario
      AND warframe_nombre = p_warframe_nombre;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE PROCEDURE sp_obtener_favoritos(
    IN p_id_usuario INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: el usuario no existe.';
    END IF;

    SELECT
        f.id_favorito,
        f.warframe_nombre,
        f.fecha_agregado
    FROM favoritos f
    WHERE f.id_usuario = p_id_usuario
    ORDER BY f.fecha_agregado DESC;
END$$

CREATE PROCEDURE sp_guardar_compra (
  IN p_id_usuario      INT,
  IN p_item_nombre     VARCHAR(255),
  IN p_item_url_nombre VARCHAR(255),
  IN p_vendedor        VARCHAR(100),
  IN p_precio_platinum INT,
  IN p_estado_vendedor VARCHAR(50)
)
BEGIN
  INSERT INTO compras_guardadas (
    id_usuario,
    item_nombre,
    item_url_nombre,
    vendedor,
    precio_platinum,
    estado_vendedor
  ) VALUES (
    p_id_usuario,
    p_item_nombre,
    p_item_url_nombre,
    p_vendedor,
    p_precio_platinum,
    p_estado_vendedor
  );

  SELECT LAST_INSERT_ID() AS id_compra;
END$$

CREATE PROCEDURE sp_eliminar_compra (
  IN p_id_compra  INT,
  IN p_id_usuario INT
)
BEGIN
  DELETE FROM compras_guardadas
  WHERE id_compra  = p_id_compra
    AND id_usuario = p_id_usuario;

  SELECT ROW_COUNT() AS eliminadas;
END$$

CREATE PROCEDURE sp_obtener_compras (
  IN p_id_usuario INT
)
BEGIN
  SELECT
    id_compra,
    item_nombre,
    item_url_nombre,
    vendedor,
    precio_platinum,
    estado_vendedor,
    fecha_guardado
  FROM compras_guardadas
  WHERE id_usuario = p_id_usuario
  ORDER BY fecha_guardado DESC;
END$$

DELIMITER ;
