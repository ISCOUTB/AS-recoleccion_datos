from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union

def sqlalchemy_to_dict(obj: Any) -> Dict[str, Any]:
    """
    Convierte un objeto SQLAlchemy a un diccionario.
    Maneja tipos especiales como datetime y Enum.
    """
    if obj is None:
        return None
    
    result = {}
    for key in obj.__dict__:
        if key.startswith('_'):
            # Ignorar atributos privados de SQLAlchemy
            continue
        
        value = getattr(obj, key)
        
        # Manejar tipos especiales
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, Enum):
            result[key] = value.value
        elif hasattr(value, '__dict__') and not key.endswith('_id'):
            # Relaciones - convertir recursivamente, pero evitar IDs que terminan en _id
            result[key] = sqlalchemy_to_dict(value)
        else:
            result[key] = value
            
    return result

def sqlalchemy_list_to_dict(obj_list: List[Any]) -> List[Dict[str, Any]]:
    """
    Convierte una lista de objetos SQLAlchemy a una lista de diccionarios.
    """
    return [sqlalchemy_to_dict(obj) for obj in obj_list]
