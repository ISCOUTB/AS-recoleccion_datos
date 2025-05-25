import pandas as pd
from sqlalchemy.orm import Session
from app.models.student_data import StudentData
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def load_excel_to_database(file_path: str, db: Session, sheet_name: str = "202430") -> dict:
    """
    Carga datos del archivo Excel a la base de datos.
    
    Args:
        file_path: Ruta al archivo Excel
        db: Sesión de base de datos
        sheet_name: Nombre de la hoja a leer (default: "202430")
        
    Returns:
        dict: Estadísticas de la carga
    """
    try:
        # Leer archivo Excel con la hoja específica
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        print(f"Leyendo hoja '{sheet_name}' del archivo Excel...")
        print(f"Filas encontradas: {len(df)}")
        
        # Mapear columnas del Excel a campos del modelo
        column_mapping = {
            'Id': 'id',
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
        
        # Renombrar columnas
        df = df.rename(columns=column_mapping)
        
        # Limpiar y convertir datos
        df = clean_dataframe(df)
        
        # Estadísticas de carga
        total_rows = len(df)
        successful_inserts = 0
        errors = 0
        
        # Insertar datos en lotes
        batch_size = 1000
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            
            for _, row in batch.iterrows():
                try:
                    # Verificar si ya existe el registro
                    existing = db.query(StudentData).filter(StudentData.id == row['id']).first()
                    
                    if existing:
                        # Actualizar registro existente
                        for key, value in row.items():
                            if pd.notna(value):
                                setattr(existing, key, value)
                    else:
                        # Crear nuevo registro
                        student_data = StudentData(**row.to_dict())
                        db.add(student_data)
                    
                    successful_inserts += 1
                    
                except Exception as e:
                    logger.error(f"Error insertando fila {row.get('id', 'unknown')}: {str(e)}")
                    errors += 1
                    continue
            
            # Commit en lotes
            try:
                db.commit()
            except Exception as e:
                logger.error(f"Error en commit del lote: {str(e)}")
                db.rollback()
                errors += batch_size
        
        return {
            "total_rows": total_rows,
            "successful_inserts": successful_inserts,
            "errors": errors,
            "success_rate": (successful_inserts / total_rows) * 100 if total_rows > 0 else 0
        }
        
    except FileNotFoundError:
        logger.error(f"Archivo no encontrado: {file_path}")
        raise FileNotFoundError(f"El archivo {file_path} no existe")
    except ValueError as e:
        if "Worksheet" in str(e):
            logger.error(f"Hoja '{sheet_name}' no encontrada en el archivo")
            raise ValueError(f"La hoja '{sheet_name}' no existe en el archivo Excel")
        else:
            raise e
    except Exception as e:
        logger.error(f"Error cargando archivo Excel: {str(e)}")
        raise e

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Limpia y convierte tipos de datos del DataFrame."""
    
    # Convertir fechas
    date_columns = ['fecha_exp_doc', 'fecha_nacimiento', 'fecha_graduacion']
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Convertir booleanos
    boolean_columns = ['icfes_antes_del_2000']
    for col in boolean_columns:
        if col in df.columns:
            df[col] = df[col].astype(bool, errors='ignore')
    
    # Convertir números enteros
    int_columns = [
        'id', 'estrato', 'creditos_matriculados', 'creditos_intentadas',
        'creditos_ganadas', 'creditos_pasadas', 'creditos_pga',
        'creditos_intentadas_periodo', 'creditos_ganadas_periodo',
        'creditos_pasadas_periodo', 'creditos_pga_periodo',
        'nro_materias_cursadas', 'nro_materias_reprobadas',
        'nro_materias_aprobadas', 'nro_materias_matriculadas',
        'nro_materias_finalizadas'
    ]
    for col in int_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').astype('Int64')
    
    # Convertir números flotantes
    float_columns = [
        'ptj_fisica', 'ptj_quimica', 'ptj_geografia', 'ptj_ciencias_sociales',
        'ptj_sociales_ciudadano', 'ptj_ciencias_naturales', 'ptj_biologia',
        'ptj_filosofia', 'ptj_lenguaje', 'ptj_lectura_critica', 'ptj_ingles',
        'ptj_historia', 'ptj_matematicas', 'ecaes', 'pga_acumulado',
        'pga_acumulado_periodo_busqueda', 'puntos_calidad_pga',
        'promedio_periodo', 'puntos_calidad_pga_periodo'
    ]
    for col in float_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Limpiar strings
    string_columns = [
        'codigo_antiguo', 'periodo_catalogo', 'programa', 'snies', 'pensum',
        'expedida_en', 'sexo', 'estado_civil', 'ciudad1', 'direccion1',
        'telefono1', 'ciudad2', 'direccion', 'nivel', 'cod_col', 'colegio',
        'dir_colegio', 'ciudad_colegio', 'depto_colegio', 'municipio_colegio',
        'pais_colegio', 'cod_estado', 'estado', 'cod_tipo', 'tipo_estudiante',
        'situacion', 'becas', 'ceres', 'periodo_ingreso', 'peri_in_prog_vigente'
    ]
    for col in string_columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace('nan', None)
    
    # Reemplazar NaN con None para compatibilidad con SQLAlchemy
    df = df.where(pd.notna(df), None)
    
    return df
