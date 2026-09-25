# Necesitamos hornear mysql-client.cnf DENTRO de la imagen en vez de
# bind-montearlo: los bind-mounts desde Windows en Docker Desktop siempre
# quedan "world-writable" del lado de Linux (no importa el permiso real en
# NTFS), y mysql ignora por seguridad cualquier config file con ese permiso.
# Copiándolo en el build y haciendo chmod acá, el permiso queda bien puesto
# por Linux, inmune a esa limitación de los bind-mounts.
FROM mysql:8.0
COPY mysql-client.cnf /etc/mysql/conf.d/client.cnf
RUN chmod 644 /etc/mysql/conf.d/client.cnf
