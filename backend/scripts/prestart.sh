set -e
set -x

# Inicializar DB
python3 -m app.database

# Correr migraciones
python3 -m alembic upgrade head

# Ejecutar script de seed solo en entorno de desarrollo
if [ "$ENVIRONMENT" = "development" ] || [ "$SEED_DATABASE" = "true" ]; then
    echo "Poblando la base de datos con datos de prueba..."
    python3 seed_database.py
else
    echo "Omitiendo la población de la base de datos en entorno no-desarrollo"
fi