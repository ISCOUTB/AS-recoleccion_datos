#!/bin/bash
set -e
set -x

echo "Iniciando script de prestart..."

# Esperar a que la base de datos esté disponible
echo "Esperando a que la base de datos esté disponible..."
python3 -c "
import time
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

max_tries = 60
tries = 0

while tries < max_tries:
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host=os.getenv('POSTGRES_HOST', 'db'),
            port=os.getenv('POSTGRES_PORT', '5432')
        )
        conn.close()
        print('Base de datos disponible!')
        break
    except psycopg2.OperationalError:
        tries += 1
        print(f'Intento {tries}/{max_tries}: Base de datos no disponible, esperando...')
        time.sleep(2)
else:
    print('No se pudo conectar a la base de datos después de 60 intentos')
    exit(1)
"

echo "Ejecutando migraciones de Alembic..."
python3 -m alembic upgrade head

echo "Poblando base de datos con datos de ejemplo..."
python3 -m app.seed_database

echo "Script de prestart completado exitosamente."
