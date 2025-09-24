import pytest
import subprocess
import time

# Prueba de compilación: Verifica que el backend se puede importar sin errores
def test_compilacion_backend():
    try:
        import app.main
    except Exception as e:
        pytest.fail(f"Error de compilación/importación: {e}")

# Prueba de tiempo de respuesta: Simula una petición al backend
# (Requiere que el backend esté corriendo en localhost:8000)
def test_tiempo_respuesta():
    import requests
    start = time.time()
    try:
        response = requests.get("http://localhost:8000/docs")
        assert response.status_code == 200
    except Exception as e:
        pytest.fail(f"Error en la petición: {e}")
    elapsed = time.time() - start
    assert elapsed < 1.5, f"Tiempo de respuesta muy alto: {elapsed:.2f}s"

# Prueba de carga: Realiza múltiples peticiones concurrentes
def test_carga_backend():
    import requests
    from concurrent.futures import ThreadPoolExecutor
    def request():
        try:
            r = requests.get("http://localhost:8000/docs")
            return r.status_code == 200
        except:
            return False
    with ThreadPoolExecutor(max_workers=1000) as executor:
        results = list(executor.map(lambda _: request(), range(1000)))
    assert all(results), "Falló alguna petición concurrente"

# Prueba de uso de recursos: Mide memoria y CPU del proceso backend
def test_uso_recursos():
    import psutil
    # Busca el proceso por nombre (ajustar si el nombre es diferente)
    for proc in psutil.process_iter(['name', 'pid']):
        if 'python' in proc.info['name']:
            p = psutil.Process(proc.info['pid'])
            mem = p.memory_info().rss / (1024*1024)
            cpu = p.cpu_percent(interval=1)
            assert mem < 500, f"Uso de memoria alto: {mem:.2f}MB"
            assert cpu < 80, f"Uso de CPU alto: {cpu:.2f}%"
            break
    else:
        pytest.skip("No se encontró proceso backend en ejecución")
