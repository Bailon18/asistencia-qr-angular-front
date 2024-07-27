import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from 'src/app/helpers';
import { Asistencia } from '../../dashboard/asistencias/model/asistencia';
import { AsistenciaDTO } from '../../dashboard/asistencias/model/asistencia-dto.model';


@Injectable({
  providedIn: 'root'
})
export class TomaAsistenciaService {

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getAsistencia(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/asistencia?page=${page}&size=${size}`);
  }

  registrarAsistencia(asistencia: Asistencia): Observable<Asistencia> {
    return this.http.post<Asistencia>(`${baseUrl}/api/asistencia/registrar`, asistencia, { headers: this.httpHeaders });
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
