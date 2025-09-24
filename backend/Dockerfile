FROM python:3.13-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para pandas y psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements.txt primero para aprovechar la caché de Docker
COPY requirements.txt .


# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Instalar dependencias de test (opcional, para pruebas unitarias)
COPY requirements-test.txt .
RUN pip install --no-cache-dir -r requirements-test.txt

# Copiar el código de la aplicación
COPY . ./backend

# Establecer el directorio de trabajo en la carpeta backend
WORKDIR /app/backend

# Crear directorios necesarios
RUN mkdir -p static/avatars static/attachments data

# Hacer ejecutable el script de prestart
RUN chmod +x scripts/prestart.sh

# Exponer el puerto que usa FastAPI
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
