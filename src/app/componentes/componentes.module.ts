import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TomaAsistenciaComponent } from './toma-asistencia/toma-asistencia.component';
import { MaterialModule } from '../material/material.module';
import { NgxScannerQrcodeModule, LOAD_WASM } from 'ngx-scanner-qrcode';
import { SafePipe } from './toma-asistencia/safe.pipe';


// Necessary to solve the problem of losing internet connection
LOAD_WASM().subscribe()

@NgModule({
  declarations: [
    TomaAsistenciaComponent, SafePipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NgxScannerQrcodeModule
  ],
  exports: [
    NgxScannerQrcodeModule
  ]
})
export class ComponentesModule { }
