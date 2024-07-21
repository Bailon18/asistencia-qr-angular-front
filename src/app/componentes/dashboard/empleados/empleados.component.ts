import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Empleado } from './model/empleados';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EmpleadosService } from './services/empleado.service';

import swall from 'sweetalert2';
import { ModalCrearActualizarComponent } from './modals/modal-crear-actualizar/modal-crear-actualizar.component';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit {

  totalItems: number = 0; 
  pageSize: number = 4; 
  pageIndex: number = 0; 

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columnas: string[] = ['ID', 'NOMBRES', 'APELLIDOS',  'INE', 'CORREO', 'TELEFONO', 'TURNO','ACCIONES'];
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

  aplicarFiltro(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value.trim();
  
    if (filterValue === '') {
      this.listarEmpleados(0, 4);
    } else {

      this.empleadoServices.filtrarEmpleados(filterValue, 0, 4).subscribe({
        next: res => {
          if (res && res.content && res.content.length > 0) {
            this.dataSource.data = res.content;
          } else {
            this.dataSource.data = [];
            swall.fire({
              icon: 'info',
              title: 'Sin resultados',
              text: 'No se encontraron empleado con ese filtro'
            });
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
