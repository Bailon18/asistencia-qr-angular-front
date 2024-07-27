import { Empleado } from "../../empleados/model/empleados";
import { EstadoAsistencia } from "./estado-asistencia";


export interface Asistencia {
    id?: number;
    empleado: Empleado;
    fecha?: string; 
    horaEntrada?: string; 
    horaSalida?: string; 
    estado?: EstadoAsistencia;
    tiempoAdicional?: string; 
    tiempoFaltante?: string; 
}
