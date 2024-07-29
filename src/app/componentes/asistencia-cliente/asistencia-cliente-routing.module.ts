import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsistenciaClienteComponent } from './asistencia-cliente.component';
import { TomarAsistenciaComponent } from './tomar-asistencia/tomar-asistencia.component';
import { LoginComponent } from './login/login.component';



const routes: Routes = [
  {
    path: '',
    component: AsistenciaClienteComponent,
    children: [
      {
        path: '',
        redirectTo: 'tomar-asistencia',
        pathMatch: 'full',
      },
      {
        path: 'tomar-asistencia',
        component: TomarAsistenciaComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'tomar-asistencia',
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsistenciaClienteRoutingModule {}
