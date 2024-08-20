import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Asistencia } from './model/asistencia';
import { AsistenciaService } from './services/asistencia.service';

import swall from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpleadosService } from '../empleados/services/empleado.service';
import { Empleado } from '../empleados/model/empleados';
import { AsistenciaDTO } from './model/asistencia-dto.model';
import { DatePipe } from '@angular/common';

import jsPDF from 'jspdf';
import autoTable, { Styles } from 'jspdf-autotable';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.component.html',
  styleUrls: ['./asistencias.component.css'],
  providers: [DatePipe]
})
export class AsistenciasComponent implements OnInit{


  totalItems: number = 0;
  pageSize: number = 4;
  pageIndex: number = 0;
  totalpages: number = 0;
  totalElements: number = 0;

  fechaInicio: Date;
  fechaFin: Date;
  asistencia : AsistenciaDTO[];

  reportForm: FormGroup;
  sugerencias: Empleado[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columnas: string[] = ['ID', 'EMPLEADO', 'FECHA', 'HORA ENTRADA', 'HORA SALIDA','ESTADO','TIEMPO ADICIONAL', 'TIEMPO FALTANTE', 'ACCIONES'];
  dataSource = new MatTableDataSource<AsistenciaDTO>;
  dataSourceCopy: Asistencia[] = [];

  constructor(
    private asistenciaService: AsistenciaService,
    private formbuilder: FormBuilder,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private empleacionService: EmpleadosService
  ) { }

  ngOnInit(): void {
    this.listarAsistencia(0, 4);

    this.reportForm = this.formbuilder.group({
      fechainicio: ['', Validators.required], 
      fechafinal: ['', Validators.required],
      checktodos: [false],
      campoBusqueda: ['', Validators.required],
      estadoAsistencia: ['TODO', Validators.required],
      idEmpleado: [''],
    });

  }


  isValidField(field: string): boolean | null {
    return (
      this.reportForm.controls[field].errors &&
      this.reportForm.controls[field].touched
    );
  }


  getFieldError(field: string): string | null {
    if (!this.reportForm.controls[field]) return null;

    const errors = this.reportForm.controls[field].errors || {};

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


  buscarEmpleado(event: any) {

    const campoBusqueda = this.reportForm.get('campoBusqueda')?.value;

    this.empleacionService.filtrarEmpleados(campoBusqueda).subscribe(res => {
      if(res && res.content && res.content.length > 0){
        this.sugerencias = res.content;
      }else{
        this.reportForm.controls['campoBusqueda'].setErrors({ empleadoNotEncontrado: true });
      }
    });
    this.validarcampobusqueda()
  }

  validarcampobusqueda(){
    this.reportForm.get('checktodos')?.setValue(false);
  }

  validarcampocheck(): void {
    this.reportForm.get('campoBusqueda')?.setValue('');
  
    const isChecked = this.reportForm.get('checktodos')?.value;
    const campoBusquedaControl = this.reportForm.get('campoBusqueda');
  
    if (!isChecked) {
      campoBusquedaControl?.setValidators(Validators.required);
      campoBusquedaControl?.enable(); // Habilita el campo de búsqueda
    } else {
      campoBusquedaControl?.clearValidators();
      campoBusquedaControl?.disable(); // Deshabilita el campo de búsqueda
    }
  
    campoBusquedaControl?.updateValueAndValidity();
  }
  

  seleccionarSugerencia(empleado: Empleado) {
    this.reportForm.patchValue({
      campoBusqueda: `${empleado.nombres} ${empleado.apellidos}`,
      idEmpleado: empleado.id
    });
    this.validarcampobusqueda()
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime2(time: string): string {
    if (!time) return '';
  
    const [hours, minutes, seconds] = time.split(':');
    const hoursNumber = parseInt(hours, 10);
    const ampm = hoursNumber >= 12 ? 'PM' : 'AM';
    const formattedHours = hoursNumber % 12 || 12;
    return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  }
  

  buscarconsulta() {
    const campoBusqueda = this.reportForm.get('campoBusqueda')?.value;
    const fechaInicio = this.formatDate(this.reportForm.get('fechainicio')?.value);
    const fechaFinal = this.formatDate(this.reportForm.get('fechafinal')?.value);
    const estadoAsistencia = this.reportForm.get('estadoAsistencia')?.value;
    const idEmpleado = parseInt(this.reportForm.get('idEmpleado')?.value);
  
    if (campoBusqueda && fechaInicio && fechaFinal) {
      this.asistenciaService.listarAsistenciaEmpleado(idEmpleado, fechaInicio, fechaFinal, estadoAsistencia, this.pageIndex, this.pageSize).subscribe(res => {
        if (res) {
          this.asistencia = res.content || [];
          this.totalItems = res.totalElements !== undefined ? res.totalElements : 0;
        } else {
          this.asistencia = [];
          this.totalItems = 0;
        }
        this.actualizarTabla();
      }, error => {
        console.error('Error al buscar asistencia:', error);
        this.asistencia = [];
        this.totalItems = 0;
        this.actualizarTabla();
      });
    } else if (fechaInicio && fechaFinal) {
      this.asistenciaService.listarAsistenciaEmpleado(0, fechaInicio, fechaFinal, estadoAsistencia, this.pageIndex, this.pageSize).subscribe(res => {
        if (res) {
          this.asistencia = res.content || [];
          this.totalItems = res.totalElements !== undefined ? res.totalElements : 0;
        } else {
          this.asistencia = [];
          this.totalItems = 0;
        }
        this.actualizarTabla();
      }, error => {
        console.error('Error al buscar asistencia:', error);
        this.asistencia = [];
        this.totalItems = 0;
        this.actualizarTabla();
      });
    } else {
      this.asistencia = [];
      this.totalItems = 0;
      this.actualizarTabla();
    }
  }
  
  actualizarTabla() {
    this.dataSource.data = this.asistencia;
    if (this.paginator) {
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalItems;
    }
  }
  
  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  isNegative(time: string): boolean {
    return time.startsWith('-');
  }

  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = 'Paginas';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Atras';
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.buscarconsulta();
    });


  }

  aplicarFiltro(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    // if (filterValue === '') {
    //   this.listarEmpleados(0, 4);
    // } else {
    //   this.empleadoServices.filtrarEmpleados(filterValue, 0, 4).subscribe({
    //     next: res => {
    //       if (res && res.content && res.content.length > 0) {
    //         this.dataSource.data = res.content;
    //       } else {
    //         this.dataSource.data = [];
    //       }

    //       if (this.dataSource.paginator) {
    //         this.dataSource.paginator.firstPage();
    //       }
    //     },
    //     error: err => {
    //       this.dataSource.data = [];
    //       swall.fire({
    //         icon: 'error',
    //         title: 'Error',
    //         text: 'Ocurrió un error al aplicar el filtro'
    //       });
    //     }
    //   });
    
  }


  listarAsistencia(pageIndex: number, pageSize: number) {
    const page = pageIndex + 0;
  
    swall.fire({
      title: "Cargando...",
      html: "Por favor espere mientras se cargan los datos.",
      allowOutsideClick: false,
      didOpen: () => {
        swall.showLoading();
      }
    });
  
    this.asistenciaService.getAsistencia(page, pageSize).subscribe({
      next: res => {
        if (res && res.content && res.content.length > 0) {
          this.dataSource = new MatTableDataSource<AsistenciaDTO>(res.content);
          this.totalItems = res.totalElements;
          this.pageSize = pageSize;
          this.pageIndex = pageIndex;
          this.dataSourceCopy = res.content;
        } else {
          this.dataSource = new MatTableDataSource<AsistenciaDTO>([]);
          this.totalItems = 0;
          this.pageSize = pageSize;
          this.pageIndex = pageIndex;
          this.dataSourceCopy = [];
  
          swall.fire({
            icon: 'info',
            title: 'Sin datos',
            text: 'No se encontraron asistencias para mostrar.',
            confirmButtonText: 'Aceptar'
          });
        }
  
        // Siempre cerrar el diálogo de carga
        swall.close();
      },
      error: error => {
        console.error("Ocurrió un error en la carga:", error);
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error en la carga'
        });
      }
    });
  }
  

  

  eliminar_asistencia(fila: any) {
    swall.fire({
      title: 'Confirmación de eliminación',
      html: `
        <p>¿Estás seguro de que deseas eliminar la asistencia de <strong>${fila.nombreCompletoEmpleado}</strong> de la fecha <strong>${fila.fecha}</strong>?</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0275d8',
      cancelButtonColor: '#d9534f',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.asistenciaService.eliminarAsistencia(fila.id).subscribe({
          next: (success: boolean) => {
            if (success) {
              swall.fire({
                icon: 'success',
                title: 'Eliminación exitosa',
                text: 'La asistencia se eliminó correctamente.',
                confirmButtonColor: '#0275d8'
              });
              this.listarAsistencia(0, 4);
            } else {
              swall.fire({
                icon: 'info',
                title: 'Atención',
                text: 'La asistencia no se encontró para eliminar.',
                confirmButtonColor: '#0275d8'
              });
            }
          },
          error: (err) => {
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: `No se pudo realizar la acción: ${err.message}`,
              confirmButtonColor: '#d9534f'
            });
          }
        });
      }
    });
  }

  
  generarPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const margin = 10;
    const titleFontSize = 18;
  
    // Agregar el título
    const title = 'Listado de Asistencias';
    doc.setFontSize(titleFontSize);
    doc.text(title, doc.internal.pageSize.width / 2, margin + titleFontSize, { align: 'center' });
  
    // Agregar un espacio debajo del título
    doc.setFontSize(12);
    doc.text('', doc.internal.pageSize.width / 2, margin + titleFontSize + 10);
  
    // Determinar el número total de páginas basado en el filtro o no
    let totalPages = 0;
    const allData: AsistenciaDTO[] = [];
    const requests: Promise<any>[] = []; // Declarar el tipo explícitamente
  
    const campoBusqueda = this.reportForm.get('campoBusqueda')?.value;
    const estadoAsistencia = this.reportForm.get('estadoAsistencia')?.value;
    const idEmpleado = parseInt(this.reportForm.get('idEmpleado')?.value) || 0;
    
    let fechaInicio: string = '';
    let fechaFinal: string = '';
    
    if (this.reportForm.get('fechainicio')?.value && this.reportForm.get('fechafinal')?.value) {
        fechaInicio = this.formatDate(this.reportForm.get('fechainicio')?.value);
        fechaFinal = this.formatDate(this.reportForm.get('fechafinal')?.value);
    }
  
  
    if (estadoAsistencia && fechaInicio && fechaFinal) {

      this.asistenciaService.listarAsistenciaEmpleado(idEmpleado, fechaInicio, fechaFinal, estadoAsistencia, 0, this.pageSize).subscribe(response => {
        if (response) {
          totalPages = Math.ceil(response.totalElements / this.pageSize);
          for (let page = 0; page < totalPages; page++) {
            requests.push(this.asistenciaService.listarAsistenciaEmpleado(idEmpleado, fechaInicio, fechaFinal, estadoAsistencia, page, this.pageSize).toPromise());
          }
  
          Promise.all(requests).then((responses: any[]) => {
            responses.forEach(response => {
              if (response && response.content) {
                allData.push(...response.content);
              } else {
                console.error('Error: Response is null or content is missing');
              }
            });
  
            const columns = [
              { title: 'ID', dataKey: 'id' },
              { title: 'Empleado', dataKey: 'empleado' },
              { title: 'Fecha', dataKey: 'fecha' },
              { title: 'Hora Entrada', dataKey: 'horaEntrada' },
              { title: 'Hora Salida', dataKey: 'horaSalida' },
              { title: 'Estado', dataKey: 'estado' },
              { title: 'Tiempo Adicional', dataKey: 'tiempoAdicional' },
              { title: 'Tiempo Faltante', dataKey: 'tiempoFaltante' },
            ];
  
            const data = allData.map(item => ({
              id: item.id,
              empleado: item.nombreCompletoEmpleado,
              fecha: item.fecha,
              horaEntrada: item.horaEntrada,
              horaSalida: item.horaSalida,
              estado: item.estado,
              tiempoAdicional: item.tiempoAdicional || '', // Asegúrate de que no sea undefined
              tiempoFaltante: item.tiempoFaltante || '', // Asegúrate de que no sea undefined
            }));
  
            autoTable(doc, {
              columns: columns,
              body: data,
              startY: margin + titleFontSize + 20, // Ajustar el valor 20 según sea necesario
              margin: { horizontal: margin },
              styles: {
                cellPadding: 2,
                fontSize: 10,
                valign: 'middle',
                overflow: 'linebreak'
              }
            });
  
            doc.save('reporte_asistencia.pdf');
          }).catch(error => {
            console.error('Error fetching pages:', error);
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al obtener los datos para la exportación'
            });
          });
        } else {
          console.error('Error: Response is null');
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontraron datos para la exportación'
          });
        }
      }, error => {
        console.error('Error fetching initial data:', error);
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al obtener los datos iniciales para la exportación'
        });
      });
    } else {

      totalPages = this.totalpages; // Usar totalpages aquí
      
      for (let page = 0; page < totalPages; page++) {
        requests.push(this.asistenciaService.getAsistencia(page, this.pageSize).toPromise());
      }
  
      Promise.all(requests).then((responses: any[]) => {
        responses.forEach(response => {
          if (response && response.content) {
            allData.push(...response.content);
          } else {
            console.error('Error: Response is null or content is missing');
          }
        });
  
        // Configurar las columnas y los datos
        const columns = [
          { title: 'ID', dataKey: 'id' },
          { title: 'Empleado', dataKey: 'empleado' },
          { title: 'Fecha', dataKey: 'fecha' },
          { title: 'Hora Entrada', dataKey: 'horaEntrada' },
          { title: 'Hora Salida', dataKey: 'horaSalida' },
          { title: 'Estado', dataKey: 'estado' },
          { title: 'Tiempo Adicional', dataKey: 'tiempoAdicional' },
          { title: 'Tiempo Faltante', dataKey: 'tiempoFaltante' },
        ];
  
        const data = allData.map(item => ({
          id: item.id,
          empleado: item.nombreCompletoEmpleado,
          fecha: item.fecha,
          horaEntrada: item.horaEntrada,
          horaSalida: item.horaSalida,
          estado: item.estado,
          tiempoAdicional: item.tiempoAdicional || '', // Asegúrate de que no sea undefined
          tiempoFaltante: item.tiempoFaltante || '', // Asegúrate de que no sea undefined
        }));
  
        autoTable(doc, {
          columns: columns,
          body: data,
          startY: margin + titleFontSize + 20, // Ajustar el valor 20 según sea necesario
          margin: { horizontal: margin },
          styles: {
            cellPadding: 2,
            fontSize: 10,
            valign: 'middle',
            overflow: 'linebreak'
          }
        });
  
        doc.save('reporte_asistencia.pdf');
      }).catch(error => {
        console.error('Error fetching pages:', error);
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al obtener los datos para la exportación'
        });
      });
    }
  }
  
  formatDate3(date: Date | string | null): string {
    if (date === null || date === undefined) {
      return '';
    }
  
    if (typeof date === 'string') {
      // Convertir el string a objeto Date
      date = new Date(date);
    }
  
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date:', date);
      return '';
    }
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  

  generarExcel() {
    const allData: AsistenciaDTO[] = [];
    const requests: Promise<any>[] = [];
  
    const campoBusqueda = this.reportForm.get('campoBusqueda')?.value;
    const fechaInicio = this.formatDate3(this.reportForm.get('fechainicio')?.value);
    const fechaFinal = this.formatDate3(this.reportForm.get('fechafinal')?.value);
    const estadoAsistencia = this.reportForm.get('estadoAsistencia')?.value;
    const idEmpleado = parseInt(this.reportForm.get('idEmpleado')?.value) || 0;
  
    if (estadoAsistencia && fechaInicio && fechaFinal) {
      // Filtro aplicado
      this.asistenciaService.listarAsistenciaEmpleado(idEmpleado, fechaInicio, fechaFinal, estadoAsistencia, 0, this.pageSize).subscribe(response => {
        if (response) {
          const totalPages = Math.ceil(response.totalElements / this.pageSize);
          for (let page = 0; page < totalPages; page++) {
            requests.push(this.asistenciaService.listarAsistenciaEmpleado(idEmpleado, fechaInicio, fechaFinal, estadoAsistencia, page, this.pageSize).toPromise());
          }
  
          Promise.all(requests).then((responses: any[]) => {
            responses.forEach(response => {
              if (response && response.content) {
                allData.push(...response.content);
              } else {
                console.error('Error: Response is null or content is missing');
              }
            });
  
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);
  
            // Agregar título
            XLSX.utils.sheet_add_aoa(ws, [['Listado de Asistencias']], { origin: 'A1' });
  
            const centerAlignment = {
              alignment: { horizontal: 'center' }
            };
  
            ws['A1'].s = centerAlignment;
            XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A2' });
  
            // Fusionar las celdas para centrar el título
            const titleRange = { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } };
            if (!ws['!merges']) {
              ws['!merges'] = [];
            }
            ws['!merges'].push(titleRange);
  
            // Agregar encabezados de columna
            XLSX.utils.sheet_add_aoa(ws, [
              ['ID', 'Empleado', 'Fecha', 'Hora Entrada', 'Hora Salida', 'Estado', 'Tiempo Adicional', 'Tiempo Faltante']
            ], { origin: 'A3' });
  
            // Aplicar estilos a los encabezados
            const headerRow = 2; // La fila de los encabezados
            for (let C = 0; C <= 7; ++C) {
              const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: C });
              if (!ws[cellAddress]) ws[cellAddress] = {};
              ws[cellAddress].s = {
                font: { bold: true },
                alignment: { horizontal: 'center' }
              };
            }
  
            allData.forEach((asistencia) => {
              const rowData = [
                asistencia.id,
                asistencia.nombreCompletoEmpleado,
                asistencia.fecha,
                asistencia.horaEntrada,
                asistencia.horaSalida,
                asistencia.estado,
                asistencia.tiempoAdicional || '',
                asistencia.tiempoFaltante || ''
              ];
              XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: -1 });
            });
  
            if (ws['!ref']) {
              const columnWidths = [];
              const range = XLSX.utils.decode_range(ws['!ref']);
              for (let C = range.s.c; C <= range.e.c; ++C) {
                let max = 0;
                for (let R = range.s.r; R <= range.e.r; ++R) {
                  const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
                  if (cell && cell.t === 's') {
                    max = Math.max(max, cell.v.toString().length);
                  }
                }
                columnWidths.push({ wch: Math.min(max + 2, 80) });
              }
              ws['!cols'] = columnWidths;
            }
  
            XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
            XLSX.writeFile(wb, 'asistencias.xlsx');
          }).catch(error => {
            console.error('Error fetching pages:', error);
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al obtener los datos para la exportación'
            });
          });
        } else {
          console.error('Error: Response is null');
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontraron datos para la exportación'
          });
        }
      }, error => {
        console.error('Error fetching initial data:', error);
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al obtener los datos iniciales para la exportación'
        });
      });
    } else {
      // Sin filtro aplicado
      const totalPages = this.totalpages; // Usar totalpages aquí
      
      for (let page = 0; page < totalPages; page++) {
        requests.push(this.asistenciaService.getAsistencia(page, this.pageSize).toPromise());
      }
  
      Promise.all(requests).then((responses: any[]) => {
        responses.forEach(response => {
          if (response && response.content) {
            allData.push(...response.content);
          } else {
            console.error('Error: Response is null or content is missing');
          }
        });
  
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);
  
        // Agregar título
        XLSX.utils.sheet_add_aoa(ws, [['Listado de Asistencias']], { origin: 'A1' });
  
        const centerAlignment = {
          alignment: { horizontal: 'center' }
        };
  
        ws['A1'].s = centerAlignment;
        XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A2' });
  
        // Fusionar las celdas para centrar el título
        const titleRange = { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } };
        if (!ws['!merges']) {
          ws['!merges'] = [];
        }
        ws['!merges'].push(titleRange);
  
        // Agregar encabezados de columna
        XLSX.utils.sheet_add_aoa(ws, [
          ['ID', 'Empleado', 'Fecha', 'Hora Entrada', 'Hora Salida', 'Estado', 'Tiempo Adicional', 'Tiempo Faltante']
        ], { origin: 'A3' });
  
        // Aplicar estilos a los encabezados
        const headerRow = 2; // La fila de los encabezados
        for (let C = 0; C <= 7; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: C });
          if (!ws[cellAddress]) ws[cellAddress] = {};
          ws[cellAddress].s = {
            font: { bold: true },
            alignment: { horizontal: 'center' }
          };
        }
  
        allData.forEach((asistencia) => {
          const rowData = [
            asistencia.id,
            asistencia.nombreCompletoEmpleado,
            asistencia.fecha,
            asistencia.horaEntrada,
            asistencia.horaSalida,
            asistencia.estado,
            asistencia.tiempoAdicional || '',
            asistencia.tiempoFaltante || ''
          ];
          XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: -1 });
        });
  
        if (ws['!ref']) {
          const columnWidths = [];
          const range = XLSX.utils.decode_range(ws['!ref']);
          for (let C = range.s.c; C <= range.e.c; ++C) {
            let max = 0;
            for (let R = range.s.r; R <= range.e.r; ++R) {
              const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
              if (cell && cell.t === 's') {
                max = Math.max(max, cell.v.toString().length);
              }
            }
            columnWidths.push({ wch: Math.min(max + 2, 80) });
          }
          ws['!cols'] = columnWidths;
        }
  
        XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
        XLSX.writeFile(wb, 'asistencias.xlsx');
      }).catch(error => {
        console.error('Error fetching pages:', error);
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al obtener los datos para la exportación'
        });
      });
    }
  }
  
  
  

  buscarAsistenciaPorFecha(){
    
  }

}
