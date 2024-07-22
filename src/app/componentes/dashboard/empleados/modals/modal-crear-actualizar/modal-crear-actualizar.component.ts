import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from "@angular/platform-browser";
import { Empleado } from '../../model/empleados';
import { EmpleadosService } from '../../services/empleado.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import swall from 'sweetalert2';
import { Cargos } from '../../model/cargo.enum';




@Component({
  selector: 'app-modal-crear-actualizar',
  templateUrl: './modal-crear-actualizar.component.html',
  styleUrls: ['./modal-crear-actualizar.component.css']
})
export class ModalCrearActualizarComponent implements OnInit {
  
  titulo: string = '';
  botonTexto: string = '';
  empleadoForm: FormGroup;

  banFoto: boolean = false;
  fotoSegura: SafeUrl;
  fotoEditado: string | ArrayBuffer | null = null;
  datoeditEmpleado: any;
  nuevoEmplado?: Empleado;

  correoOriginal: string = '';
  nombreOriginal: string = '';
  apellidoOriginal: string = '';
  ineOriginal: string = '';
  telefonoOriginal: string = '';

  @ViewChild('imagenInputFile', { static: false }) imagenInputFile?: ElementRef;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private empleadoService: EmpleadosService,
    @Inject(MAT_DIALOG_DATA) public datoedit: any,
    private dialog: MatDialogRef<ModalCrearActualizarComponent>
  ) {

    
  }

  ngOnInit(): void {

    this.titulo = 'Registrar Empleado';
    this.botonTexto = 'Guardar';
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);

    this.empleadoForm = this.fb.group({
      id: [''],
      nombres: ['', [Validators.required, this.validarTexto]],
      apellidos:  ['', [Validators.required, this.validarTexto]],
      ine: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      correo: ['', [Validators.required, Validators.email]],
      direccion: [''],
      telefono: ['',[Validators.required, this.validarTelefonoNumero, Validators.minLength(10), Validators.maxLength(10)]],
      turno: [2, Validators.required],
      fechaNacimiento: [today, [Validators.required, this.validarEdad(18)]],
      tipoEmpleado: ['Empleado', Validators.required],
      foto:  ['', Validators.required],
      cargo: ['Contabilidad', Validators.required],
      fotourl: [''],
    });

    if (this.datoedit) {
      this.empleadoService.buscarEmpleadoId(this.datoedit.id).subscribe({
        next: (resp) => {

          this.datoeditEmpleado = resp;
        
          this.empleadoForm.patchValue({
            id: resp.id,
            nombres: resp.nombres,
            apellidos: resp.apellidos,
            ine: resp.ine,
            correo: resp.correo,
            direccion: resp.direccion,
            telefono: resp.telefono,
            turno: resp.turno.id,
            fechaNacimiento: new Date(resp.fechaNacimiento),
            tipoEmpleado: resp.tipoEmpleado,
            cargo: resp.cargo
          });

          this.fotoEditado = 'data:image/png;base64,' + resp.foto;
          const imagenBase64 = 'data:image/png;base64,' + resp.foto;
          this.fotoSegura = this.sanitizer.bypassSecurityTrustUrl(imagenBase64);


          this.titulo = "Editar Empleado";
          this.botonTexto = "Actualizar Empleado"

        },
        error: (error) => {
          console.error('Error al buscar el servicio:', error);
        }
      });
    }else{

      this.mostrar_foto_default()
    }

    
  }

  guardarEmpleado() {

    if (this.empleadoForm.valid) {


        let mensaje = 'Empleado creada con exito!';
        const formData = new FormData();
  
        const foto01 = this.empleadoForm.get('foto')?.value;
        const foto02 = this.imagenInputFile?.nativeElement.files[0];

        const foto = (foto01 instanceof File) ? foto01 : foto02;
   
        this.nuevoEmplado = {
          nombres: this.empleadoForm.value.nombres,
          apellidos: this.empleadoForm.value.apellidos,
          ine: this.empleadoForm.value.ine,
          correo: this.empleadoForm.value.correo,
          direccion: this.empleadoForm.value.direccion,
          telefono: this.empleadoForm.value.telefono,
          turno: { id: this.empleadoForm.value.turno },
          fechaNacimiento: this.empleadoForm.value.fechaNacimiento,
          tipoEmpleado: this.empleadoForm.value.tipoEmpleado ,
          fechaRegistro: new Date(),
          cargo: this.empleadoForm.value.cargo,
          foto: null
        }

        if (this.datoeditEmpleado != null) {
          mensaje = 'Empleado actualizado correctamente!';
          this.nuevoEmplado.id = this.empleadoForm.value.id;
  
          if (foto == null) {
            formData.append('foto', this.fotoEditado!.toString());
          } else {
            formData.append('foto', foto);
            
          }
        } else {
          formData.append('foto', foto);
        }
  
        formData.append(
          'empleado',
          new Blob([JSON.stringify(this.nuevoEmplado)], {
            type: 'application/json',
          })
        );

        if (this.datoedit) {
  
          this.empleadoService.actualizarEmpleado(this.datoedit.id, formData).subscribe({
            next: () => {
              this.dialog.close()
              this.mostrarmensaje(mensaje, 'success')
            },
            error: (er) => {
              this.mostrarmensaje(er.error.mensaje, 'error')
            }
          })
        } else {
  
          this.empleadoService.guardarEmpleado(formData).subscribe({
            next: () => {
              this.dialog.close()
              this.mostrarmensaje(mensaje, 'success')
            },
            error: (er) => {
              this.mostrarmensaje(er.error.mensaje, 'error')
            }
          })
        }
      }
     
    }
  
  mostrarmensaje(mensaje: string, tipo: string) {
    if (tipo == 'success') {
      swall.fire({
        icon: 'success',
        html: mensaje,
      });
    } else {
      swall.fire({
        icon: 'error',
        html: mensaje,
      });
    }
  }

  banImagenprev() {
    if (this.empleadoForm != null) {
      this.banFoto = true;
      this.empleadoForm.controls['foto'].setErrors(null);
    }
  }

  mostrar_foto_default(): void {
 
    const imagePath = 'assets/img/photos/perfil.jpg';
    this.fotoSegura = this.sanitizer.bypassSecurityTrustUrl(imagePath);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', imagePath, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const file = new File([blob], 'perfil.jpg', { type: 'image/jpeg', lastModified: Date.now() });
        this.empleadoForm.patchValue({
          foto: file
        });
        this.empleadoForm.get('foto')?.updateValueAndValidity();
      }
    };
    xhr.send();
  }
  

  mostrarVistaPrevia(): void {
    const input = this.imagenInputFile?.nativeElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imagenPreview = document.getElementById(
          'imagenPreview'
        ) as HTMLImageElement;
        imagenPreview.src = e.target.result;
        imagenPreview.style.display = 'block';
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  isValidField(field: string): boolean | null {
    return (
      this.empleadoForm.controls[field].errors &&
      this.empleadoForm.controls[field].touched
    );
  }

  getFieldError(field: string): string | null {
    if (!this.empleadoForm.controls[field]) return null;

    const errors = this.empleadoForm.controls[field].errors || {};

    for (const key of Object.keys(errors)) {
      switch (key) {
        
        case 'required':
          return `campo es requerido`;
        
        case 'numeroInvalido':
          return `campo tiene que ser númerico `;

        case 'TextoInvalido':
            return `campo tiene que ser solo letras `;

        case 'edadInvalida':
          return 'Mayor de 18 años';

        case 'email':
          return `campo no tiene el formato correcto`;

        case 'minlength':
            const minLength = errors['minlength']?.requiredLength;
            return `debe tener al menos ${minLength} digitos`;
          
        case 'maxlength':
              const maxLength = errors['maxlength']?.requiredLength;
              return `debe tener con maximo ${maxLength} digitos`;

        case 'ineInvalid':
          return `INE ya esta registrado`;

        case 'correoInvalid':
            return `Correo ya esta registrado`;

        case 'telefonoInvalid':
          return `Teléfono ya esta registrado`;

        case 'fotoInvalid':

        case 'empleadoExiste':
          return `Nombre y apellido se encuentra registrado`;
      }
    }
    return null;
  }


  onNombreApellidoChange() {
    const nombre = this.empleadoForm.value.nombres;
    const apellido = this.empleadoForm.value.apellidos;
    if (nombre && apellido) {
      this.verificarExistenciaEmpleado(nombre, apellido);
    }
  }

  verificarExistenciaEmpleado(nombre: string, apellido: string) {

    if(nombre != this.nombreOriginal && apellido != this.apellidoOriginal){

      this.empleadoService.verificarNombreApellido(nombre, apellido).subscribe(existe => {

        console.log(existe);

        if (existe) {
          this.empleadoForm.controls['nombres'].setErrors({ empleadoExiste: true });
          this.empleadoForm.controls['apellidos'].setErrors({ empleadoExiste: true });
  
        }else{
          this.empleadoForm.controls['nombres'].setErrors(null);
          this.empleadoForm.controls['apellidos'].setErrors(null);
        }
      });


    }

  }

  validarcorreo(event: any) {
    const correoFormControl = this.empleadoForm.get('correo');
  
    if (correoFormControl?.valid) {
      const nuevoCorreo = (event.target as HTMLInputElement).value;
  
      if (nuevoCorreo !== this.correoOriginal) {

        this.empleadoService.verificarCorreoElectronico(nuevoCorreo).subscribe(res => {
          if (res) {
            correoFormControl.setErrors({ correoInvalid: 'Correo ya está registrado' });
          } else {
            correoFormControl.setErrors(null);
          }
        });
      }
    }
  }


  validarIne(event: any){

    if (this.empleadoForm.controls['ine'].valid){

      const ine = (event.target as HTMLInputElement).value;

      if(ine != this.ineOriginal){

        this.empleadoService.verificarIne(ine).subscribe(res => {
          if(res){
            this.empleadoForm.controls['ine'].setErrors({ ineInvalid: true});
          }else{
            this.empleadoForm.controls['ine'].setErrors(null);
          }
        })
      }


    }

  }

  validarTelefono(event: any){

    if (this.empleadoForm.controls['telefono'].valid){

      const telefono = (event.target as HTMLInputElement).value;

      if(telefono != this.telefonoOriginal){

        this.empleadoService.verificarTelefono(telefono).subscribe(res => {
          if(res){
            this.empleadoForm.controls['telefono'].setErrors({ telefonoInvalid: true});
          }else{
            this.empleadoForm.controls['telefono'].setErrors(null);
          }
        })
      }


    }

  }

  validarTelefonoNumero(control:any) {
    const telefono = control.value;
    if (!/^\d+$/.test(telefono)) {
      return { numeroInvalido: true };
    }
    return null;
  }

  validarEdad(edadMinima: number) {

    return (control: { value: Date }) => {
      const fechaNacimiento = control.value;
      const today = new Date();
      const edad = today.getFullYear() - fechaNacimiento.getFullYear();
      return edad >= edadMinima ? null : { edadInvalida: true };
    };
  }

  validarDocumentoIdentidad(control:any) {
    const documentoIdentidad = control.value;
    if (!/^\d+$/.test(documentoIdentidad)) {
      return { numeroInvalido: true };
    }
    return null;
  }

  validarTexto(control: any) {
    const texto = control.value;
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚ\s]*$/.test(texto)) {
      return { TextoInvalido: true };
    }
    return null;
  }
  
}
