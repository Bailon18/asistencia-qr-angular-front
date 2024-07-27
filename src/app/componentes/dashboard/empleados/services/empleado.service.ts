import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from 'src/app/helpers';
import { Empleado } from '../model/empleados';


@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {


  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(private http: HttpClient) { }

  getEmpleados(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/empleado?page=${page}&size=${size}`);
  }


  buscarEmpleadoId(id:number): Observable<Empleado>{
    return this.http.get<Empleado>(`${baseUrl}/api/empleado/obtenerEmpleadoId/${id}`);
  }

  filtrarEmpleados(searchText: string, page: number = 0, size: number = 5): Observable<any> {
    const params = new HttpParams()
      .set('searchText', searchText)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${baseUrl}/api/empleado/search`, { params });
  }

  guardarEmpleado(dato: FormData): Observable<any> {
    return this.http.post(`${baseUrl}/api/empleado`, dato);
  }

  actualizarEmpleado(id: number, dato: FormData): Observable<any> {
    return this.http.put(`${baseUrl}/api/empleado/${id}`, dato);
  }

  eliminarEmpleado(empleadoId: number): Observable<void> {
    const url = `${baseUrl}/api/empleado/${empleadoId}`;
    return this.http.delete<void>(url);
  }

  generarQrEmpleado(id: Number): Observable<boolean> {
    const url = `${baseUrl}/api/email/enviarqr/${id}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<boolean>(url, { headers });
  }

  
  verificarNombreApellido(nombres: string, apellidos: string): Observable<boolean> {
    const params = new HttpParams()
      .set('nombres', nombres)
      .set('apellidos', apellidos);
    return this.http.get<boolean>(`${baseUrl}/api/empleado/validar/nombres-apellidos`, { params });
  }

  verificarCorreoElectronico(correo: string): Observable<boolean> {
    const params = new HttpParams().set('correo', correo);
    return this.http.get<boolean>(`${baseUrl}/api/empleado/validar/correo`, { params });
  }

  verificarIne(ine: string): Observable<boolean> {
    const params = new HttpParams().set('ine', ine);
    return this.http.get<boolean>(`${baseUrl}/api/empleado/validar/ine`, { params });
  }

  verificarTelefono(telefono: string): Observable<boolean> {
    const params = new HttpParams().set('telefono', telefono);
    return this.http.get<boolean>(`${baseUrl}/api/empleado/validar/telefono`, { params });
  }


}
