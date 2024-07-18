import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { AsistenciasComponent } from './asistencias/asistencias.component';


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'empleados',
        pathMatch: 'full',
      },
      {
        path: 'empleados',
        component: EmpleadosComponent,
      },

      {
        path: 'asistencia',
        component: AsistenciasComponent,
      }
    ],
  },

  {
    path: '**',
    redirectTo: 'empleados',
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
