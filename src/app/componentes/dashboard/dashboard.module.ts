import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { EmpleadosComponent } from './empleados/empleados.component';
import { AsistenciasComponent } from './asistencias/asistencias.component';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { MaterialModule } from 'src/app/material/material.module';
import { ModalCrearActualizarComponent } from './empleados/modals/modal-crear-actualizar/modal-crear-actualizar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    DashboardComponent,
    NavbarComponent,
    EmpleadosComponent,
    AsistenciasComponent,
    ModalCrearActualizarComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DashboardModule { }
