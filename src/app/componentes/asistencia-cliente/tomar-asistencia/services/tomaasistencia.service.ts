import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError, timeout } from 'rxjs';
import { Asistencia } from 'src/app/componentes/dashboard/asistencias/model/asistencia';
import { AsistenciaDTO } from 'src/app/componentes/dashboard/asistencias/model/asistencia-dto.model';
import baseUrl from 'src/app/helpers';



@Injectable({
  providedIn: 'root'
})
export class TomarAsistenciaService {

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getAsistencia(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/asistencia?page=${page}&size=${size}`);
  }

  registrarAsistencia(asistencia: Asistencia): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${baseUrl}/api/asistencia/registrar`, asistencia, { headers: this.httpHeaders }).pipe(
      tap((response) => {
        console.log('Respuesta de registrarAsistencia:', response);
        console.log('Status:', response.status);
        console.log('Message:', response.message);
      }),
      catchError((error) => {
        console.error('Error en registrarAsistencia:', error);
        return throwError(() => error);
      })
    );
  }
  
  
  
  

  verificarAsistencia(empleadoId: number, fecha: string): Observable<AsistenciaDTO> {
    const params = new HttpParams()
      .set('empleadoId', empleadoId.toString())
      .set('fecha', fecha);
    return this.http.get<AsistenciaDTO>(`${baseUrl}/api/asistencia/verificar`, { params });
  }

  actualizarAsistencia(id: number, empleadoId: number, horaEntrada: string): Observable<boolean> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('empleadoId', empleadoId.toString())
      .set('horaEntrada', horaEntrada);
    return this.http.post<boolean>(`${baseUrl}/api/asistencia/actualizar`, null, { params });
  }
}
