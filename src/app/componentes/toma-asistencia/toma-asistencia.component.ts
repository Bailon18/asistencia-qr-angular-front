import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
  NgxScannerQrcodeService,
  NgxScannerQrcodeComponent,
  ScannerQRCodeSelectedFiles,
} from 'ngx-scanner-qrcode';
import { TomaAsistenciaService } from './services/tomaasistencia.service';
import { EmpleadosService } from '../dashboard/empleados/services/empleado.service';
import swall from 'sweetalert2';
import { Asistencia } from '../dashboard/asistencias/model/asistencia';
import { EstadoAsistencia } from '../dashboard/asistencias/model/estado-asistencia';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Empleado } from '../dashboard/empleados/model/empleados';
import { Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toma-asistencia',
  templateUrl: './toma-asistencia.component.html',
  styleUrls: ['./toma-asistencia.component.css']
})
export class TomaAsistenciaComponent implements OnInit{
  
  output: string = '';
  isProcessing = false;
  empleadoIdSeleccionado: number = 0;
  empleadoSeleccionado: string = '';
  sugerencias: Empleado[] = [];
  selectedCamera: string | null = null;

  @ViewChild('action') action!: NgxScannerQrcodeComponent;

  public percentage = 100;
  public quality = 100;


  digits: number[] = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  hourHandPosition = 0
  minuteHandPosition = 0;
  secondHandPosition = 0;

  dateTime = {
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    second: '',
  }

  counter !: Subscription

  tomarasistenciaForm: FormGroup;

  public config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: window.innerWidth > 640 ? 640 : window.innerWidth,
        height: window.innerHeight > 400 ? 400 : window.innerHeight
      },
    },
    canvasStyles: [
      { lineWidth: 3, strokeStyle: 'green', fillStyle: '#55f02880' },
      { font: '', strokeStyle: 'transparent', fillStyle: 'transparent' }
    ]
  };
  

  constructor(
    private qrcode: NgxScannerQrcodeService,
    private tomaasistenciaService: TomaAsistenciaService,
    private empleadoService: EmpleadosService,
    private formbuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {

    // setTimeout(() => {
    //   this.handle(this.action, 'start');
    // }, 0); 
    //this.handle(this.action, 'start');
    this.startCamera();
    this.tomarasistenciaForm = this.formbuilder.group({
      campoBusqueda: [''],
      idEmpleado: [''],
    });

    this.startClock()
  }

  startCamera(): void {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        requestAnimationFrame(() => {
          this.handle(this.action, 'start');
        });
      });
    } else {
      requestAnimationFrame(() => {
        this.handle(this.action, 'start');
      });
    }
  }
  
  startClock(){
    this.counter = timer(0, 1000).subscribe(res => {
      let date = new Date();
    
      let second = date.getSeconds();
      let minute = date.getMinutes();
      let hour = date.getHours();
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      this.dateTime.year = year.toString();
      this.dateTime.month = this.displayDoubleDigits(month);
      this.dateTime.day = this.displayDoubleDigits(day);

      this.dateTime.hour = this.displayDoubleDigits(hour);
      this.dateTime.minute = this.displayDoubleDigits(minute);
      this.dateTime.second = this.displayDoubleDigits(second);
    
  
      this.secondHandPosition =((second / 60) * 360) + 90;
      this.minuteHandPosition = ((minute / 60) * 360) + ((second / 60) * 6) + 90;
      this.hourHandPosition = ((hour / 12) * 360) + ((minute / 60) * 30) + 90;

    });
  }


  displayDoubleDigits(value: number): string {
      return ('00'+ value).slice(-2)
  }
  

  ngAfterViewInit(): void {
    this.action.isReady.subscribe((res: any) => {
      this.applyConstraints();
    });
  }

  onCameraSelectionChange(deviceId: string | null): void {
    if (deviceId) {
      this.selectedCamera = deviceId;
      this.handle(this.action, 'start');
    } else {
      this.handle(this.action, 'stop');
    }
  }
  
  buscarEmpleado(event: any) {
    const campoBusqueda = this.tomarasistenciaForm.get('campoBusqueda')?.value;
  
    this.empleadoService.filtrarEmpleados(campoBusqueda).subscribe(res => {
      if (res && res.content && res.content.length > 0) {
        this.sugerencias = [res.content[0]]; 
      } else {
        this.tomarasistenciaForm.controls['campoBusqueda'].setErrors({ empleadoNotEncontrado: true });
      }
    });
  }
  
  isValidField(field: string): boolean | null {
    return (
      this.tomarasistenciaForm.controls[field].errors &&
      this.tomarasistenciaForm.controls[field].touched
    );
  }

  getFieldError(field: string): string | null {
    if (!this.tomarasistenciaForm.controls[field]) return null;

    const errors = this.tomarasistenciaForm.controls[field].errors || {};

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return `campo es requerido`;
        case 'empleadoNotEncontrado':
          return `No se encontro empleado`;
      }
    }
    return null;
  }

  seleccionarSugerencia(empleado: Empleado) {
    this.tomarasistenciaForm.patchValue({
      campoBusqueda: `${empleado.nombres} ${empleado.apellidos}`,
      idEmpleado: empleado.id
    });

    if(empleado.id != undefined && empleado.id != null){
      
      this.tomarAsistencia(empleado.id)
    }
  }

  onEvent(e: ScannerQRCodeResult[], action?: any): void {
    if (this.isProcessing) {
      return;
    }
    
    this.action.stop();
    this.isProcessing = true;
  
    const result = e[0].value;

    let idEmpleadoStr = this.extractIneNumber(result) || '';
    let idEmpleado = parseInt(idEmpleadoStr, 10);

    this.tomarAsistencia(idEmpleado)
  }
  
  tomarAsistencia(idEmpleado: number) {
    this.empleadoService.buscarEmpleadoId(idEmpleado).subscribe({

      next: (resultadoEmpleado) => {

        if (resultadoEmpleado == null) {


          swall.fire({
            icon: 'error',
            title: 'Empleado no registrado',
            text: 'El empleado con el QR proporcionado no está registrado.'
          });

        } else {

          this.empleadoIdSeleccionado = resultadoEmpleado.id || 0;
          this.empleadoSeleccionado = resultadoEmpleado.nombres + ' '+ resultadoEmpleado.apellidos

          if (resultadoEmpleado.id != null) {

            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0];

            this.tomaasistenciaService.verificarAsistencia(resultadoEmpleado.id, formattedDate).subscribe({

              next: resultadoAsistencia => {

                if(resultadoAsistencia != null){

                  if(resultadoAsistencia.horaEntrada != null && resultadoAsistencia.horaSalida != null){

        
                    Swal.fire({
                      icon: 'error',
                      title: 'Toma de asistencia completada',
                      html: `
                        <div style="text-align: left;">
                          <p style="margin: 0;"><strong>${this.empleadoSeleccionado}</strong>, usted ya terminó de registrar su asistencia el día de hoy.</p>
                          <ul style="margin: 0; padding-left: 20px;">
                            <li>Fecha: <strong>${resultadoAsistencia.fecha}</strong></li>
                            <li>Hora de ingreso: <strong>${resultadoAsistencia.horaEntrada}</strong></li>
                            <li>Hora de salida: <strong>${resultadoAsistencia.horaSalida}</strong></li>
                          </ul>
                          <p style="margin: 0;">Inténtelo mañana.</p>
                        </div>
                      `
                    }).then(() => {
                      this.limpiarCampos();
                    });
                    
                    
                  }else if ( resultadoAsistencia.horaSalida == null){

                    this.tomaasistenciaService.actualizarAsistencia(resultadoAsistencia.id, this.empleadoIdSeleccionado, resultadoAsistencia.horaEntrada).subscribe({
                      next: (res) => {

                        if(res){
                          const now = new Date();
                          const fecha = now.toLocaleDateString(); 
                          const hora = now.toLocaleTimeString();  
                          Swal.fire({
                            icon: 'success',
                            title: 'Asistencia actualizada',
                            html: `
                              <div style="text-align: left;">
                                <p><strong>${this.empleadoSeleccionado}</strong>, se ha registrado su horario de salida.</p>
                                <ul style="margin: 0; padding-left: 20px;">
                                  <li>Fecha: <strong>${fecha}</strong></li>
                                  <li>Hora de salida: <strong>${hora}</strong></li>
                                </ul>
                              </div>
                            `
                          }).then(() => {
                            this.limpiarCampos();
                          });
                        }
                      },
                      error: (error) => {
                        console.error('Error al registrar la asistencia:', error);
                      }
                    });
                }
              
                }else{
                      const nuevaAsistencia: Asistencia = {
                        empleado: { id: this.empleadoIdSeleccionado }, 
                        estado: EstadoAsistencia.PENDIENTE
                      };

                      this.tomaasistenciaService.registrarAsistencia(nuevaAsistencia).subscribe({
                        next: (res) => {
                          const now = new Date();
                          const fecha = now.toLocaleDateString(); 
                          const hora = now.toLocaleTimeString();  
                          
                          swall.fire({
                            icon: 'success',
                            title: 'Asistencia registrada',
                            html: `
                              <div style="text-align: left;">
                                <p><strong>${this.empleadoSeleccionado}</strong>, se ha registrado su horario de ingreso.</p>
                                <ul style="margin: 0; padding-left: 20px;">
                                  <li>Fecha: <strong>${fecha}</strong></li>
                                  <li>Hora de ingreso: <strong>${hora}</strong></li>
                                </ul>
                              </div>
                            `
                          }).then(() => {
                            this.limpiarCampos();
                          });

   
                          
                        },
                        error: (error) => {
                          console.error('Error al registrar la asistencia:', error);
                        }
                      });
                }

              }, error: error => {

              }
            })
          }
        }

        this.action.start();
        this.isProcessing = false;
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Empleado no registrado',
          text: 'El empleado con el QR proporcionado no está registrado.'
        });
  
        this.action.start();
        this.isProcessing = false;
      }
    });
  }

  limpiarCampos(){
    this.tomarasistenciaForm.patchValue({
      campoBusqueda: ''
    });

    this.sugerencias = [];
  }
  
  extractIneNumber(text: string): string | null {
    const match = text.match(/-\s*(\d+)/);
    return match ? match[1] : null;
  }
  
  handle(action: any, fn: string): void {
    const playDeviceFacingBack = (devices: any[]) => {
      const device = devices.find(f => (/back|rear|environment/gi.test(f.label)));
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    }

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe((r: any) => console.log(fn, r), alert);
    } else {
      action[fn]().subscribe((r: any) => console.log(fn, r), alert);
    }
  }

  applyConstraints() {
    const width = window.innerWidth * (this.percentage / 100);
    const height = window.innerHeight * (this.percentage / 100);
    const frameRate = { ideal: (this.quality / 100) * 60, max: 60 };
  
    const constraints = this.action.applyConstraints({
      video: {
        width: { ideal: width }, 
        height: { ideal: height }, 
        frameRate: frameRate, 
        aspectRatio: 1.777777778 
      }
    });

  }

  ingresarLogin(){
    this.router.navigate(['/login']);
  }

}
