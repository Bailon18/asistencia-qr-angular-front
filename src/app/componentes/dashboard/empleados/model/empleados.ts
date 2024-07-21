import { SafeResourceUrl } from "@angular/platform-browser";
import { Turno } from "./turno";
import { TipoEmpleado } from "./tipo_empleado.enum";

export interface Empleado {
    id ?: number;
    nombres: string;
    apellidos: string;
    ine: string;
    correo: string;
    direccion: string;
    telefono: string;
    turno: Turno;
    fechaNacimiento: Date;
    fechaRegistro ?: Date; 
    tipoEmpleado: TipoEmpleado;
    //estado: boolean;
    foto ?: string | SafeResourceUrl | null
}

