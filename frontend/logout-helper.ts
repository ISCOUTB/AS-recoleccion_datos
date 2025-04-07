export const logout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem("token")
    
    // Disparar un evento personalizado para notificar a todos los componentes
    window.dispatchEvent(new Event("app:logout"))
    
    // Redirigir a la página de inicio
    window.location.href = "/"
  }