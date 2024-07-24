import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from 'src/app/helpers';



@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {


  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(private http: HttpClient) { }

  getAsistencia(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/asistencia?page=${page}&size=${size}`);
  }

  listarAsistenciaEmpleado(empleadoId: number, fechaInicio: string, fechaFinal: string, estado: string, page: number = 0, size: number = 4): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFinal', fechaFinal)
      .set('estado', estado)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${baseUrl}/api/asistencia/listarAsistenciaEmpleado/${empleadoId}`, { params });
   
  }

  eliminarAsistencia(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${baseUrl}/api/asistencia/${id}`);
  }

}
