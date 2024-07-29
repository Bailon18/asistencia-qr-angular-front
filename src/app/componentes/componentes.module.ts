import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { NgxScannerQrcodeModule, LOAD_WASM } from 'ngx-scanner-qrcode';
import { AsistenciaClienteComponent } from './asistencia-cliente/asistencia-cliente.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


LOAD_WASM().subscribe()

@NgModule({
  declarations: [
    AsistenciaClienteComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NgxScannerQrcodeModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    NgxScannerQrcodeModule
  ]
})
export class ComponentesModule { }
