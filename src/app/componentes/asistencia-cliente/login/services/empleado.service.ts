import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empleado } from 'src/app/componentes/dashboard/empleados/model/empleados';
import baseUrl from 'src/app/helpers';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(private http: HttpClient) { }

  validarLogin(username: string, contrasena: string): Observable<Empleado> {
    const params = new HttpParams()
      .set('username', username)
      .set('contrasena', contrasena);

    return this.http.get<Empleado>(`${baseUrl}/api/empleado/validarLogin`, { params });
  }
}
