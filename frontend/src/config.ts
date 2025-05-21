interface Config {
  apiUrl: string;
  environment: string;
}

// Configuración para diferentes entornos
const configs: Record<string, Config> = {
  development: {
    apiUrl: "http://localhost:8000/api",
    environment: "development"
  },
  production: {
    // En producción, la API podría estar en un dominio diferente o en la misma URL base
    apiUrl: "/api", // URL relativa para mismo dominio, o URL completa para dominio separado
    environment: "production"
  }
};

// Determinar el entorno actual
const env = import.meta.env.MODE ?? "development";

// Exportar la configuración para el entorno actual
export const config = configs[env] ?? configs.development;

// Para depuración
console.log(`Running in ${config.environment} mode with API URL ${config.apiUrl}`);

export default config;