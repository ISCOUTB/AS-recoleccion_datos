from sqlalchemy import Boolean, Column, Integer, String, DateTime, Float, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base

class StudentData(Base):
    """Modelo para almacenar los datos base de estudiantes del Excel"""
    __tablename__ = "student_data"

    # CAMBIO: ID ahora es String, no Integer
    id = Column(String, primary_key=True, index=True)  # Cambiado de Integer a String
    
    # Datos básicos del estudiante
    codigo_antiguo = Column(String, index=True)
    periodo_catalogo = Column(String)
    programa = Column(String)
    snies = Column(String)
    pensum = Column(String)
    
    # Datos personales
    expedida_en = Column(String)
    fecha_exp_doc = Column(Date)
    sexo = Column(String)
    estado_civil = Column(String)
    fecha_nacimiento = Column(Date)
    ciudad1 = Column(String)
    direccion1 = Column(String)
    telefono1 = Column(String)
    ciudad2 = Column(String)
    direccion = Column(String)
    
    # Datos educativos
    nivel = Column(String)
    cod_col = Column(String)
    colegio = Column(String)
    dir_colegio = Column(String)
    ciudad_colegio = Column(String)
    depto_colegio = Column(String)
    municipio_colegio = Column(String)
    pais_colegio = Column(String)
    fecha_graduacion = Column(Date)
    
    # Puntajes ICFES
    ptj_fisica = Column(Float)
    ptj_quimica = Column(Float)
    ptj_geografia = Column(Float)
    ptj_ciencias_sociales = Column(Float)
    ptj_sociales_ciudadano = Column(Float)
    ptj_ciencias_naturales = Column(Float)
    ptj_biologia = Column(Float)
    ptj_filosofia = Column(Float)
    ptj_lenguaje = Column(Float)
    ptj_lectura_critica = Column(Float)
    ptj_ingles = Column(Float)
    ptj_historia = Column(Float)
    ptj_matematicas = Column(Float)
    icfes_antes_del_2000 = Column(Boolean)
    ecaes = Column(Float)
    
    # Estado académico
    cod_estado = Column(String)
    estado = Column(String)
    cod_tipo = Column(String)
    tipo_estudiante = Column(String)
    
    # Rendimiento académico
    pga_acumulado = Column(Float)
    pga_acumulado_periodo_busqueda = Column(Float)
    creditos_matriculados = Column(Integer)
    creditos_intentadas = Column(Integer)
    creditos_ganadas = Column(Integer)
    creditos_pasadas = Column(Integer)
    creditos_pga = Column(Integer)
    puntos_calidad_pga = Column(Float)
    promedio_periodo = Column(Float)
    creditos_intentadas_periodo = Column(Integer)
    creditos_ganadas_periodo = Column(Integer)
    creditos_pasadas_periodo = Column(Integer)
    creditos_pga_periodo = Column(Integer)
    puntos_calidad_pga_periodo = Column(Float)
    nro_materias_cursadas = Column(Integer)
    nro_materias_reprobadas = Column(Integer)
    nro_materias_aprobadas = Column(Integer)
    nro_materias_matriculadas = Column(Integer)
    nro_materias_finalizadas = Column(Integer)
    
    # Información adicional
    situacion = Column(String)
    estrato = Column(Integer)
    becas = Column(String)
    ceres = Column(String)
    periodo_ingreso = Column(String)
    peri_in_prog_vigente = Column(String)
    
    # Estado de validación
    is_validated = Column(Boolean, default=False)
    validation_date = Column(DateTime)
    
    # Relación con usuario registrado
    user = relationship("User", back_populates="student_data", uselist=False)
