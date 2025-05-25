import sys
import os
from datetime import datetime, timedelta
import random
import traceback
import enum
import psycopg2
import bcrypt 
from dotenv import load_dotenv
import re
import glob

# Cargar variables de entorno
load_dotenv()

# Definir UserRole enum igual que en models.py para referencia
class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    ADMIN = "ADMIN"

def get_connection_params():
    """Obtener parametros de conexion desde variables de entorno."""
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        print("DATABASE_URL encontrada y cargada desde variables de entorno.")
        try:
            if "postgresql+psycopg2://" in database_url:
                database_url = database_url.replace("postgresql+psycopg2://", "postgresql://")
                print("URL convertida a formato PostgreSQL estándar.")
            if database_url.startswith("postgresql://"):
                match = re.match(r'postgresql://(?:([^:@]+)(?::([^@]*))?@)?([^:/]+)(?::(\\d+))?/([^?]+)', database_url)
                if match:
                    db_user, db_pass, db_host, db_port, db_name = match.groups()
                    db_port = db_port or "5432"
                    if not db_pass:
                        print("ADVERTENCIA: La contraseña de la base de datos no está definida en la URL.")
                    return db_user, db_pass, db_host, db_port, db_name
                else:
                    print("No se pudo parsear la URL de la base de datos, usando valores de entorno individuales")
            else:
                print("Formato de URL no reconocido para la base de datos.")
        except Exception as e:
            print(f"Error al parsear DATABASE_URL: {e}")
    
    db_user = os.getenv("POSTGRES_USER")
    db_pass = os.getenv("POSTGRES_PASSWORD")
    db_host = os.getenv("POSTGRES_HOST", "db")
    db_port = os.getenv("POSTGRES_PORT", "5432")
    db_name = os.getenv("POSTGRES_DB")
    if not db_user or not db_pass or not db_name:
        raise ValueError("Faltan variables de entorno requeridas para la conexión a la base de datos.")
    print(f"Usando parámetros de conexión: Host={db_host}, Puerto={db_port}, BD={db_name}, Usuario={db_user}")
    return db_user, db_pass, db_host, db_port, db_name

def get_password_hash(password):
    """Función para generar hash de contraseña usando bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def find_excel_file():
    """Busca el archivo Excel en la carpeta data."""
    data_dir = "data"
    
    # Buscar archivos Excel en la carpeta data
    excel_patterns = [
        os.path.join(data_dir, "*.xlsx"),
        os.path.join(data_dir, "*.xls"),
        os.path.join(data_dir, "datos_estudiantes.*"),
        os.path.join(data_dir, "estudiantes.*")
    ]
    
    excel_files = []
    for pattern in excel_patterns:
        excel_files.extend(glob.glob(pattern))
    
    if not excel_files:
        print("⚠️  No se encontró archivo Excel en la carpeta 'data'")
        print("   Coloca tu archivo Excel en: data/datos_estudiantes.xlsx")
        return None
    
    # Usar el primer archivo encontrado
    excel_file = excel_files[0]
    print(f"📊 Archivo Excel encontrado: {excel_file}")
    return excel_file

def safe_convert_value(value, target_type="string"):
    """Convierte valores de pandas de forma segura para PostgreSQL."""
    import pandas as pd
    import numpy as np
    
    # Manejar valores nulos/NA
    if pd.isna(value) or value is None or str(value).lower() in ['nan', 'nat', '<na>']:
        return None
    
    # Manejar diferentes tipos
    if target_type == "string":
        result = str(value).strip() if str(value).strip() != 'nan' else None
        return result if result and result != 'None' else None
    elif target_type == "int":
        try:
            if isinstance(value, (int, np.integer)):
                return int(value)
            elif isinstance(value, (float, np.floating)):
                if np.isfinite(value):
                    return int(value)
                else:
                    return None
            else:
                # Intentar convertir string a int
                str_val = str(value).strip()
                if str_val.replace('.', '').replace('-', '').isdigit():
                    return int(float(str_val))
                else:
                    return None
        except (ValueError, TypeError):
            return None
    elif target_type == "float":
        try:
            if isinstance(value, (int, float, np.number)):
                return float(value) if np.isfinite(float(value)) else None
            else:
                return float(str(value)) if str(value).replace('.', '').replace('-', '').replace('e', '').replace('E', '').replace('+', '').isdigit() else None
        except (ValueError, TypeError):
            return None
    elif target_type == "date":
        try:
            if pd.isna(value):
                return None
            if isinstance(value, str):
                return pd.to_datetime(value, errors='coerce').date() if pd.to_datetime(value, errors='coerce') is not pd.NaT else None
            else:
                return pd.to_datetime(value, errors='coerce').date() if pd.to_datetime(value, errors='coerce') is not pd.NaT else None
        except:
            return None
    elif target_type == "bool":
        if isinstance(value, bool):
            return value
        elif str(value).lower() in ['true', '1', 'yes', 'si', 'sí']:
            return True
        elif str(value).lower() in ['false', '0', 'no']:
            return False
        else:
            return None
    
    return None

def load_excel_data_to_db(conn, cursor):
    """Carga datos del Excel a la base de datos."""
    print("🔍 Buscando archivo Excel...")
    
    excel_file = find_excel_file()
    if not excel_file:
        print("⚠️  Saltando carga de Excel - archivo no encontrado")
        return False
    
    try:
        # Importar pandas
        import pandas as pd
        import numpy as np
        
        print(f"📖 Leyendo archivo Excel: {excel_file}")
        
        # Intentar leer con diferentes hojas
        sheet_names_to_try = ["202430", "Hoja1", "Sheet1", 0]  # 0 = primera hoja
        
        df = None
        used_sheet = None
        
        for sheet_name in sheet_names_to_try:
            try:
                print(f"   Intentando leer hoja: {sheet_name}")
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                used_sheet = sheet_name
                print(f"   ✅ Hoja '{sheet_name}' leída exitosamente ({len(df)} filas)")
                break
            except Exception as e:
                print(f"   ❌ Error leyendo hoja '{sheet_name}': {str(e)}")
                continue
        
        if df is None:
            print("❌ No se pudo leer ninguna hoja del archivo Excel")
            return False
        
        # Mostrar información de debug
        print(f"\n🔍 INFORMACIÓN DEL EXCEL:")
        print(f"   📊 Dimensiones: {df.shape[0]} filas x {df.shape[1]} columnas")
        print(f"   📝 Primeras 5 columnas: {list(df.columns[:5])}")
        
        # Buscar columna de ID (ahora que sabemos que es string)
        id_column_candidates = ['Id', 'ID', 'id', 'Codigo_antiguo', 'codigo_antiguo']
        id_column = None
        
        print(f"\n🔍 BUSCANDO COLUMNA DE ID (STRING)...")
        for candidate in id_column_candidates:
            if candidate in df.columns:
                # Verificar que tenga datos válidos (strings)
                sample_values = df[candidate].dropna().head(3)
                print(f"   Probando '{candidate}': {sample_values.tolist()}")
                
                # Para IDs string, solo verificamos que no estén vacíos
                valid_ids = 0
                for val in sample_values:
                    string_val = safe_convert_value(val, 'string')
                    if string_val and len(string_val) > 0:
                        valid_ids += 1
                
                if valid_ids > 0:
                    id_column = candidate
                    print(f"   ✅ Usando '{candidate}' como columna de ID")
                    break
                else:
                    print(f"   ❌ '{candidate}' no tiene IDs válidos")
        
        if id_column is None:
            print("❌ No se encontró una columna de ID válida")
            print("📋 Columnas disponibles:")
            for i, col in enumerate(df.columns[:10]):  # Solo mostrar primeras 10
                sample_val = df[col].iloc[0] if len(df) > 0 else "N/A"
                print(f"   {i+1:2d}. '{col}' = {sample_val}")
            return False
        
        # Mapear columnas del Excel a campos del modelo
        column_mapping = {
            id_column: 'id',  # Usar la columna de ID que encontramos
            'Codigo_antiguo': 'codigo_antiguo',
            'Periodo_catalogo': 'periodo_catalogo',
            'Programa': 'programa',
            'Snies': 'snies',
            'Pensum': 'pensum',
            'Expedida_en': 'expedida_en',
            'Fecha_exp_doc': 'fecha_exp_doc',
            'Sexo': 'sexo',
            'Estado_civil': 'estado_civil',
            'Fecha_nacimento': 'fecha_nacimiento',  # Nota: typo en el original
            'Ciudad1': 'ciudad1',
            'Direccion1': 'direccion1',
            'Telefono1': 'telefono1',
            'Ciudad2': 'ciudad2',
            'Direccion': 'direccion',
            'Nivel': 'nivel',
            'Cod_col': 'cod_col',
            'Colegio': 'colegio',
            'Dir_colegio': 'dir_colegio',
            'Ciudad_colegio': 'ciudad_colegio',
            'Depto_colegio': 'depto_colegio',
            'Municipio_colegio': 'municipio_colegio',
            'Pais_colegio': 'pais_colegio',
            'Fecha_graduacion': 'fecha_graduacion',
            'Ptj_fisica': 'ptj_fisica',
            'Ptj_quimica': 'ptj_quimica',
            'Ptj_geografia': 'ptj_geografia',
            'Ptj_ciencias_sociales': 'ptj_ciencias_sociales',
            'Ptj_sociales_ciudadano': 'ptj_sociales_ciudadano',
            'Ptj_ciencias_naturales': 'ptj_ciencias_naturales',
            'Ptj_biologia': 'ptj_biologia',
            'Ptj_filosofia': 'ptj_filosofia',
            'Ptj_lenguaje': 'ptj_lenguaje',
            'Ptj_lectura_critica': 'ptj_lectura_critica',
            'Ptj_ingles': 'ptj_ingles',
            'Ptj_historia': 'ptj_historia',
            'Ptj_matematicas': 'ptj_matematicas',
            'Icfes_antes_del_2000': 'icfes_antes_del_2000',
            'Ecaes': 'ecaes',
            'Cod_estado': 'cod_estado',
            'Estado': 'estado',
            'Cod_tipo': 'cod_tipo',
            'Tipo_estudiante': 'tipo_estudiante',
            'Pga_acomulado': 'pga_acumulado',  # Nota: typo en el original
            'Pga_acomulado_periodo_busqueda': 'pga_acumulado_periodo_busqueda',
            'Creditos_matriculados': 'creditos_matriculados',
            'Creditos_intentadas': 'creditos_intentadas',
            'Creditos_ganadas': 'creditos_ganadas',
            'Creditos_pasadas': 'creditos_pasadas',
            'Creditos_pga': 'creditos_pga',
            'Puntos_calidad_pga': 'puntos_calidad_pga',
            'Promedio_periodo': 'promedio_periodo',
            'Creditos_intentadas_periodo': 'creditos_intentadas_periodo',
            'Creditos_ganadas_periodo': 'creditos_ganadas_periodo',
            'Creditos_pasadas_periodo': 'creditos_pasadas_periodo',
            'Creditos_pga_periodo': 'creditos_pga_periodo',
            'Puntos_calidad_pga_periodo': 'puntos_calidad_pga_periodo',
            'Nro_materias_cursadas': 'nro_materias_cursadas',
            'Nro_materias_reprobadas': 'nro_materias_reprobadas',
            'Nro_materias_aprobadas': 'nro_materias_aprobadas',
            'Nro_materias_matriculadas': 'nro_materias_matriculadas',
            'Nro_materias_finalizadas': 'nro_materias_finalizadas',
            'Situacion': 'situacion',
            'Estrato': 'estrato',
            'Becas': 'becas',
            'Ceres': 'ceres',
            'Periodo_ingreso': 'periodo_ingreso',
            'Peri_in_prog_vigente': 'peri_in_prog_vigente'
        }
        
        print("🔄 Procesando datos...")
        
        # Renombrar columnas (solo las que existen)
        existing_mapping = {k: v for k, v in column_mapping.items() if k in df.columns}
        df = df.rename(columns=existing_mapping)
        
        print(f"📋 Columnas mapeadas: {len(existing_mapping)}")
        
        # Definir tipos de columnas para conversión segura
        column_types = {
            'id': 'string',  # CAMBIO: Ahora es string
            'estrato': 'int',
            'creditos_matriculados': 'int',
            'creditos_intentadas': 'int',
            'creditos_ganadas': 'int',
            'creditos_pasadas': 'int',
            'creditos_pga': 'int',
            'creditos_intentadas_periodo': 'int',
            'creditos_ganadas_periodo': 'int',
            'creditos_pasadas_periodo': 'int',
            'creditos_pga_periodo': 'int',
            'nro_materias_cursadas': 'int',
            'nro_materias_reprobadas': 'int',
            'nro_materias_aprobadas': 'int',
            'nro_materias_matriculadas': 'int',
            'nro_materias_finalizadas': 'int',
            'ptj_fisica': 'float',
            'ptj_quimica': 'float',
            'ptj_geografia': 'float',
            'ptj_ciencias_sociales': 'float',
            'ptj_sociales_ciudadano': 'float',
            'ptj_ciencias_naturales': 'float',
            'ptj_biologia': 'float',
            'ptj_filosofia': 'float',
            'ptj_lenguaje': 'float',
            'ptj_lectura_critica': 'float',
            'ptj_ingles': 'float',
            'ptj_historia': 'float',
            'ptj_matematicas': 'float',
            'ecaes': 'float',
            'pga_acumulado': 'float',
            'pga_acumulado_periodo_busqueda': 'float',
            'puntos_calidad_pga': 'float',
            'promedio_periodo': 'float',
            'puntos_calidad_pga_periodo': 'float',
            'fecha_exp_doc': 'date',
            'fecha_nacimiento': 'date',
            'fecha_graduacion': 'date',
            'icfes_antes_del_2000': 'bool'
        }
        
        # Estadísticas de carga
        total_rows = len(df)
        successful_inserts = 0
        errors = 0
        
        print(f"📊 Insertando {total_rows} registros en la base de datos...")
        
        # Mostrar algunos ejemplos de IDs para verificar
        print(f"🔍 Ejemplos de IDs encontrados:")
        for i in range(min(5, len(df))):
            raw_id = df.iloc[i]['id']
            converted_id = safe_convert_value(raw_id, 'string')
            print(f"   Fila {i+1}: '{raw_id}' -> '{converted_id}'")
        
        # Insertar datos fila por fila con conversión segura
        for index, row in df.iterrows():
            try:
                # Verificar que tenemos un ID válido (string)
                student_id = safe_convert_value(row.get('id'), 'string')
                if student_id is None or len(student_id.strip()) == 0:
                    if index < 10:  # Solo mostrar los primeros 10 errores
                        print(f"   ⚠️  Fila {index + 1}: ID inválido '{row.get('id')}' (tipo: {type(row.get('id'))})")
                    errors += 1
                    continue
                
                # Verificar si ya existe el registro
                cursor.execute("SELECT id FROM student_data WHERE id = %s", (student_id,))
                existing = cursor.fetchone()
                
                # Preparar datos con conversión segura
                safe_data = {}
                for col, value in row.items():
                    if col in column_types:
                        safe_data[col] = safe_convert_value(value, column_types[col])
                    else:
                        safe_data[col] = safe_convert_value(value, 'string')
                
                if existing:
                    # Actualizar registro existente
                    update_fields = []
                    update_values = []
                    for key, value in safe_data.items():
                        if key != 'id' and value is not None:
                            update_fields.append(f"{key} = %s")
                            update_values.append(value)
                    
                    if update_fields:
                        update_values.append(student_id)
                        update_query = f"UPDATE student_data SET {', '.join(update_fields)} WHERE id = %s"
                        cursor.execute(update_query, update_values)
                else:
                    # Crear nuevo registro
                    columns = list(safe_data.keys()) + ['is_validated']
                    values = list(safe_data.values()) + [False]
                    placeholders = ', '.join(['%s'] * len(columns))
                    
                    insert_query = f"""
                        INSERT INTO student_data ({', '.join(columns)}) 
                        VALUES ({placeholders})
                    """
                    cursor.execute(insert_query, values)
                
                successful_inserts += 1
                
                # Mostrar progreso cada 500 registros
                if (index + 1) % 500 == 0:
                    conn.commit()
                    print(f"   ✅ Procesados {index + 1}/{total_rows} registros...")
                
            except Exception as e:
                if errors < 10:  # Solo mostrar los primeros 10 errores
                    print(f"   ❌ Error insertando fila {index + 1} (ID: {row.get('id', 'unknown')}): {str(e)}")
                errors += 1
                conn.rollback()
                continue
        
        # Commit final
        try:
            conn.commit()
        except Exception as e:
            print(f"❌ Error en commit final: {str(e)}")
            conn.rollback()
        
        success_rate = (successful_inserts / total_rows) * 100 if total_rows > 0 else 0
        
        print(f"\n📈 Resumen de carga de Excel:")
        print(f"   • Archivo: {excel_file}")
        print(f"   • Hoja utilizada: {used_sheet}")
        print(f"   • Columna ID usada: {id_column}")
        print(f"   • Total de filas: {total_rows}")
        print(f"   • Registros insertados/actualizados: {successful_inserts}")
        print(f"   • Errores: {errors}")
        print(f"   • Tasa de éxito: {success_rate:.1f}%")
        
        return successful_inserts > 0
        
    except ImportError:
        print("❌ Error: pandas no está instalado. Instalando...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "openpyxl"])
        print("✅ pandas instalado. Reinicia el contenedor.")
        return False
    except Exception as e:
        print(f"❌ Error cargando Excel: {str(e)}")
        traceback.print_exc()
        return False

def create_sample_student_data(conn, cursor):
    """Crear datos de ejemplo para la tabla student_data (solo si no hay Excel)."""
    print("📝 Creando datos de ejemplo para estudiantes...")
    
    # Datos de ejemplo que simulan el Excel con IDs string
    sample_students = [
        {
            "id": "T000YAHAA",
            "codigo_antiguo": "EST001",
            "programa": "Ingenieria en Sistemas",
            "sexo": "M",
            "estado_civil": "Soltero",
            "fecha_nacimiento": "2000-05-15",
            "estrato": 3,
            "ptj_matematicas": 75.5,
            "ptj_lectura_critica": 68.2,
            "ptj_ingles": 72.1,
            "pga_acumulado": 4.2,
            "situacion": "Activo",
            "tipo_estudiante": "Nuevo"
        },
        {
            "id": "T000YAHAB",
            "codigo_antiguo": "EST002",
            "programa": "Ingenieria Electronica",
            "sexo": "M",
            "estado_civil": "Soltero",
            "fecha_nacimiento": "1999-08-22",
            "estrato": 2,
            "ptj_matematicas": 82.3,
            "ptj_lectura_critica": 71.8,
            "ptj_ingles": 69.5,
            "pga_acumulado": 4.5,
            "situacion": "Activo",
            "tipo_estudiante": "Nuevo"
        },
        {
            "id": "T000YAHAC",
            "codigo_antiguo": "EST003",
            "programa": "Psicologia",
            "sexo": "F",
            "estado_civil": "Soltera",
            "fecha_nacimiento": "2001-02-10",
            "estrato": 4,
            "ptj_matematicas": 65.7,
            "ptj_lectura_critica": 85.3,
            "ptj_ingles": 78.9,
            "pga_acumulado": 4.1,
            "situacion": "Activo",
            "tipo_estudiante": "Nuevo"
        },
        {
            "id": "T000YAHAD",
            "codigo_antiguo": "EST004",
            "programa": "Administracion de Empresas",
            "sexo": "F",
            "estado_civil": "Soltera",
            "fecha_nacimiento": "1999-11-30",
            "estrato": 3,
            "ptj_matematicas": 70.2,
            "ptj_lectura_critica": 73.6,
            "ptj_ingles": 74.1,
            "pga_acumulado": 3.8,
            "situacion": "Activo",
            "tipo_estudiante": "Continuo"
        },
        {
            "id": "T000YAHAE",
            "codigo_antiguo": "EST005",
            "programa": "Medicina",
            "sexo": "M",
            "estado_civil": "Soltero",
            "fecha_nacimiento": "1998-07-18",
            "estrato": 5,
            "ptj_matematicas": 88.9,
            "ptj_lectura_critica": 91.2,
            "ptj_ingles": 85.7,
            "pga_acumulado": 4.7,
            "situacion": "Activo",
            "tipo_estudiante": "Continuo"
        }
    ]
    
    for student in sample_students:
        try:
            # Verificar si ya existe
            cursor.execute("SELECT id FROM student_data WHERE id = %s", (student["id"],))
            existing = cursor.fetchone()
            
            if existing:
                print(f"   Estudiante {student['id']} ya existe, saltando...")
                continue
            else:
                print(f"   Creando estudiante {student['id']}...")
                # Insertar nuevo
                cursor.execute("""
                    INSERT INTO student_data (
                        id, codigo_antiguo, programa, sexo, estado_civil, fecha_nacimiento,
                        estrato, ptj_matematicas, ptj_lectura_critica, ptj_ingles,
                        pga_acumulado, situacion, tipo_estudiante, is_validated
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    student["id"], student["codigo_antiguo"], student["programa"],
                    student["sexo"], student["estado_civil"], student["fecha_nacimiento"],
                    student["estrato"], student["ptj_matematicas"], student["ptj_lectura_critica"],
                    student["ptj_ingles"], student["pga_acumulado"], student["situacion"],
                    student["tipo_estudiante"], False
                ))
            
            conn.commit()
            
        except Exception as e:
            print(f"❌ Error creando estudiante {student['id']}: {e}")
            conn.rollback()

def create_admin_user(conn, cursor):
    """Crear usuario administrador con credenciales especiales."""
    print("👤 Creando usuario administrador...")
    
    admin_email = "admin@universidad.edu.co"
    admin_password = "Admin2025!"
    
    try:
        # Verificar si ya existe
        cursor.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
        existing = cursor.fetchone()
        
        if existing:
            print("   Usuario administrador ya existe, actualizando contraseña...")
            hashed_password = get_password_hash(admin_password)
            cursor.execute("""
                UPDATE users SET 
                    hashed_password = %s, 
                    is_admin = %s, 
                    role = %s,
                    updated_at = %s
                WHERE email = %s
            """, (hashed_password, True, UserRole.ADMIN.value, datetime.now(), admin_email))
        else:
            print("   Creando nuevo usuario administrador...")
            hashed_password = get_password_hash(admin_password)
            cursor.execute("""
                INSERT INTO users (
                    email, hashed_password, full_name, is_admin, role, 
                    created_at, is_active, data_validated
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                admin_email, hashed_password, "Administrador del Sistema",
                True, UserRole.ADMIN.value, datetime.now(), True, True
            ))
        
        conn.commit()
        print(f"   ✅ Usuario administrador: {admin_email}")
        
    except Exception as e:
        print(f"❌ Error creando usuario administrador: {e}")
        conn.rollback()

def main():
    """Función principal para poblar la base de datos con el nuevo esquema."""
    try:
        # Obtener parámetros de conexión
        db_user, db_pass, db_host, db_port, db_name = get_connection_params()
        
        print("🔌 Conectando a la base de datos...")
        print(f"   Host: {db_host}, Puerto: {db_port}, BD: {db_name}, Usuario: {db_user}")
        
        # Conectar a la base de datos
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_pass,
            host=db_host,
            port=db_port
        )
        
        cursor = conn.cursor()
        
        print("✅ Conexión exitosa a la base de datos.")
        
        print("\n🚀 Iniciando población de la base de datos...")
        
        # Intentar cargar datos del Excel primero
        excel_loaded = load_excel_data_to_db(conn, cursor)
        
        # Si no se pudo cargar Excel, usar datos de ejemplo
        if not excel_loaded:
            print("📝 Usando datos de ejemplo...")
            create_sample_student_data(conn, cursor)
        
        # Crear usuario administrador
        create_admin_user(conn, cursor)
        
        print("\n🎉 Base de datos poblada exitosamente!")
        print("\n" + "="*50)
        print("📋 CREDENCIALES DE ADMINISTRADOR")
        print("="*50)
        print("Email: admin@universidad.edu.co")
        print("Contraseña: Admin2025!")
        print("="*50)
        
        if excel_loaded:
            print("\n📊 Datos del Excel cargados automáticamente")
            print("🔍 IDs de ejemplo cargados como strings (ej: 'T000YAHAA')")
        else:
            print("\n⚠️  Para cargar tu Excel:")
            print("   1. Coloca tu archivo en: data/datos_estudiantes.xlsx")
            print("   2. Reinicia el contenedor: docker-compose restart")
        
        return True
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        traceback.print_exc()
        return False
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
