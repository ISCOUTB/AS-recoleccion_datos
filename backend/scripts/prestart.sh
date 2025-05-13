set -e
set -x

# Inicializar DB
python3 -m app.database

# Correr migraciones
python3 -m alembic upgrade head

# Cargar datos de prueba
python3 -m app.seed_database

