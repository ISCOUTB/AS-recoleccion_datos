# Pruebas unitarias y métricas

Para ejecutar las pruebas unitarias y de rendimiento en el backend, asegúrate de instalar las dependencias de desarrollo:

```bash
pip install -r requirements-test.txt
```

Luego ejecuta las pruebas con:

```bash
pytest tests/test_backend.py -v
```

Si usas Docker, las dependencias de producción ya están incluidas en el contenedor. Puedes agregar la instalación de dependencias de test en tu Dockerfile si quieres automatizar las pruebas dentro del contenedor.
