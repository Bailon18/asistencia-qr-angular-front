import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Empleado } from './model/empleados';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EmpleadosService } from './services/empleado.service';

import swall from 'sweetalert2';
import { ModalCrearActualizarComponent } from './modals/modal-crear-actualizar/modal-crear-actualizar.component';

import jsPDF from 'jspdf';
import autoTable, { Styles } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TipoEmpleado } from './model/tipo_empleado.enum';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit {

  totalItems: number = 0;
  pageSize: number = 4;
  pageIndex: number = 0;
  totalpages: number = 0;
  totalElements: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columnas: string[] = ['ID', 'EMPLEADO', 'INE', 'TELEFONO', 'CARGO','TURNO','ACCIONES'];
  dataSource = new MatTableDataSource<Empleado>;
  dataSourceCopy: Empleado[] = [];



  constructor(
    private empleadoServices: EmpleadosService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.listarEmpleados(0, 4);
  }

  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = 'Paginas';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Atras';
    this.dataSource.paginator = this.paginator;
  }


  generarExcel() {
    const allData: Empleado[] = [];

    const requests = [];
    for (let page = 0; page < this.totalpages; page++) {
      requests.push(this.empleadoServices.getEmpleados(page, this.pageSize).toPromise());
    }

    Promise.all(requests).then((responses: any[]) => {
      responses.forEach(response => {
        allData.push(...response.content);
      });

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

      XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(ws, [['Listado de empleados']], { origin: 'A2' });

      const centerAlignment = {
        alignment: { horizontal: 'center' }
      };

      ws['A2'].s = centerAlignment;
      XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A3' });

      // Fusionar las celdas para centrar el título
      const titleRange = { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } };
      if (!ws['!merges']) {
        ws['!merges'] = [];
      }
      ws['!merges'].push(titleRange);

      XLSX.utils.sheet_add_aoa(ws, [
        ['EMPLEADO', 'INE', 'CORREO', 'TELEFONO', 'CARGO', 'TURNO', 'FECHA DE REGISTRO']
      ], { origin: 'A4' });

      allData.forEach((empleado) => {
        const rowData = [
          `${empleado.nombres} ${empleado.apellidos}`,
          empleado.ine,
          empleado.correo,
          empleado.telefono,
          empleado.cargo,
          empleado.turno.nombre,
          empleado.fechaRegistro
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

      XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
      XLSX.writeFile(wb, 'empleados.xlsx');
    }).catch(error => {
      console.error('Error fetching pages:', error);
      swall.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al obtener los datos para la exportación'
      });
    });
  }


  generarPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const margin = 10;
    const titleFontSize = 18;

    // Agregar el título
    const title = 'Listado de Empleados';
    doc.setFontSize(titleFontSize);
    doc.text(title, doc.internal.pageSize.width / 2, margin + titleFontSize, { align: 'center' });

    // Agregar un espacio debajo del título
    doc.setFontSize(12);
    doc.text('', doc.internal.pageSize.width / 2, margin + titleFontSize + 10);

    // Obtener todos los datos
    const allData: Empleado[] = [];
    const requests = [];

    for (let page = 0; page < this.totalpages; page++) {
      requests.push(this.empleadoServices.getEmpleados(page, this.pageSize).toPromise());
    }

    Promise.all(requests).then((responses: any[]) => {
      responses.forEach(response => {
        allData.push(...response.content);
      });

      // Configurar las columnas y los datos
      const columns = [
        { header: 'EMPLEADO', dataKey: 'empleado' },
        { header: 'INE', dataKey: 'ine' },
        { header: 'CORREO', dataKey: 'correo' },
        { header: 'TELEFONO', dataKey: 'telefono' },
        { header: 'CARGO', dataKey: 'cargo' },
        { header: 'TURNO', dataKey: 'turno' },
        { header: 'TIPO EMPLEADO', dataKey: 'TipoEmpleado' }
      ];

      const data = allData.map(empleado => ({
        empleado: `${empleado.nombres} ${empleado.apellidos}`,
        ine: empleado.ine,
        correo: empleado.correo || '',  // Convertir undefined a string vacío
        telefono: empleado.telefono || '',  // Convertir undefined a string vacío
        cargo: (empleado.cargo as unknown as string) || '',  // Convertir enums a string
        turno: empleado.turno?.nombre || '',  // Convertir undefined a string vacío
        TipoEmpleado: empleado.tipoEmpleado // Convertir Date a string de fecha
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

      // Guardar el archivo PDF
      doc.save('empleados.pdf');
    }).catch(error => {
      console.error('Error fetching pages:', error);
      swall.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al obtener los datos para la exportación'
      });
    });
  }


  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (filterValue === '') {
      this.listarEmpleados(0, 4);
    } else {
      this.empleadoServices.filtrarEmpleados(filterValue, 0, 4).subscribe({
        next: res => {
          if (res && res.content && res.content.length > 0) {
            this.dataSource.data = res.content;
          } else {
            this.dataSource.data = [];
          }

          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: err => {
          this.dataSource.data = [];
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al aplicar el filtro'
          });
        }
      });
    }
  }

  listarEmpleados(pageIndex: number, pageSize: number) {
    const page = pageIndex + 0;

    let timerInterval: any;

    swall.fire({
      title: "Cargando...",
      html: "Por favor espere mientras se cargan los datos.",
      allowOutsideClick: false,
      didOpen: () => {
        swall.showLoading();
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    });

    this.empleadoServices.getEmpleados(page, pageSize).subscribe({


      next: res => {


        this.totalpages = res.totalPages
        this.totalElements = res.totalElements
        console.log('totalpages ', this.totalpages)
        console.log('totalElements ', this.totalElements)
        if (res && res.content && res.content.length > 0) {
          this.dataSource = new MatTableDataSource<Empleado>(res.content);
          this.totalItems = res.totalElements;
          this.pageSize = pageSize;
          this.pageIndex = pageIndex;
          this.dataSourceCopy = res.content;
        } else {
          this.dataSource = new MatTableDataSource<Empleado>([]);
          this.totalItems = 0;
          this.pageSize = pageSize;
          this.pageIndex = pageIndex;
          this.dataSourceCopy = [];
        }

        swall.close();
      },
      error: error => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error en la carga'
        });
        console.log("Ocurrió un error en la carga");
      }
    });
  }

  nuevo_empleado() {
    this.dialog.open(ModalCrearActualizarComponent, {
         width:'600px',
     }).afterClosed().subscribe(valor =>{
        this.listarEmpleados(0, 4);
    });
  }

  editar_empleado(fila: any){
    this.dialog.open(ModalCrearActualizarComponent,{
      width:'600px',
      data:fila
    }).afterClosed().subscribe(valor =>{
      this.listarEmpleados(0, 4);
    });
  }


  eliminar_empleado(fila: any) {
    swall.fire({
      html: `
        <p>¿Estás seguro de que deseas eliminar a este empleado?</p>
        <p><strong>Nota:</strong> Al confirmar la eliminación, también se eliminarán todas las asistencias asociadas a este empleado.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0275d8',
      cancelButtonColor: '#d9534f',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.empleadoServices.eliminarEmpleado(fila.id).subscribe({
          next: () => {
            swall.fire({
              icon: 'success',
              confirmButtonColor: '#0275d8',
              html: 'El empleado y todas sus asistencias asociadas se eliminaron correctamente.'
            });
            this.listarEmpleados(0, 4);
          },
          error: (err) => {
            swall.fire({
              icon: 'error',
              confirmButtonColor: '#d9534f',
              html: `Error al realizar la acción: <strong>${err.message}</strong>`
            });
          }
        });
      }
    });
  }


  generar_qr(fila: any) {
    if (fila) {
      // Mostrar mensaje de carga
      swall.fire({
        html: 'Enviando correo...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          swall.showLoading();
        }
      });

      this.empleadoServices.generarQrEmpleado(fila.id).subscribe({
        next: (res) => {
          if (res === true) {
            swall.fire({
              icon: 'success',
              title: 'Correo enviado con éxito',
              text: 'Se envio el qr generado al correo .' + fila.correo,
              showConfirmButton: true
            });
          } else {
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al enviar el correo.',
              showConfirmButton: true
            });
          }
        },
        error: (error) => {
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al enviar el correo.',
            showConfirmButton: true
          });
          console.error("Error al recuperar el correo electrónico:", error);
        }
      });
    }
  }


  generar_qr_todos(): void {

  }
}
