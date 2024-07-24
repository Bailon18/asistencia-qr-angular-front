export interface AsistenciaDTO {
    id: number;
    nombreCompletoEmpleado: string;
    fecha: string;
    horaEntrada: string; 
    horaSalida: string; 
    estado: string;
    tiempoAdicional?: string; 
    tiempoFaltante?: string; 
  }
  