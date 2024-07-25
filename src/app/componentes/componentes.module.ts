import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TomaAsistenciaComponent } from './toma-asistencia/toma-asistencia.component';
import { MaterialModule } from '../material/material.module';




@NgModule({
  declarations: [
    TomaAsistenciaComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,

  ]
})
export class ComponentesModule { }
