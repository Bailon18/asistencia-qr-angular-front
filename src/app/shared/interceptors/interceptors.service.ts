import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, concatMap } from 'rxjs/operators';
import { TokenService } from 'src/app/componentes/dashboard/usuario/services/token.service';
import { LoginService } from 'src/app/componentes/login/login.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private loginService: LoginService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    if (!this.tokenService.isLogged()) {
      return next.handle(req);
    }

    const token = this.tokenService.getToken();
    if (token) {
      req = this.addTokenToRequest(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, req, next)),
      tap(this.handleResponse)
    );
  }

  private addTokenToRequest(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> | Observable<never> {
    if (error.status === 401) {
      const token = this.tokenService.getToken();
      return this.loginService.refresh(token).pipe(
        concatMap((data: any) => {
          console.log('Refreshing token....');
          this.tokenService.setToken(data.token);
          console.log(data.token)
          const intReq = this.addTokenToRequest(req, data.token);
          return next.handle(intReq);
        })
      );
    }else if(error.status === 403) {
      this.tokenService.logOut();
      return throwError(error);
    } else {
      return throwError(error);
    }
    return throwError(error);
  }


  private handleResponse(event: HttpEvent<any>): void {
    if (event instanceof HttpResponse) {
      console.log('Successful request:', event);
    }
  }
}

export const interceptorProvider = [
  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
];
