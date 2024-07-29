import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TomarAsistenciaComponent } from './tomar-asistencia/tomar-asistencia.component';
import { MaterialModule } from 'src/app/material/material.module';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { SafePipe } from './tomar-asistencia/safe.pipe';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsistenciaClienteRoutingModule } from './asistencia-cliente-routing.module';
import { AsistenciaClienteComponent } from './asistencia-cliente.component';

@NgModule({
  declarations: [
    TomarAsistenciaComponent,
    SafePipe,
    LoginComponent
  ],
  imports: [
    CommonModule,
    AsistenciaClienteRoutingModule,
    NgxScannerQrcodeModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AsistenciaClienteModule { }
