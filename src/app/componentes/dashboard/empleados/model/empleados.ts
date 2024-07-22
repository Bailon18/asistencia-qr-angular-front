import { SafeResourceUrl } from "@angular/platform-browser";
import { Turno } from "./turno";
import { TipoEmpleado } from "./tipo_empleado.enum";
import { Cargos } from "./cargo.enum";

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
    cargo: Cargos;
    //estado: boolean;
    foto ?: string | SafeResourceUrl | null
}

