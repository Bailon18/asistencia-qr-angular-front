import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import swall from 'sweetalert2';
import { Empleado } from '../../dashboard/empleados/model/empleados';
import { LoginService } from './services/empleado.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.loginService.validarLogin(username, password).subscribe(
        (empleado: Empleado) => {

          console.log("empleado ", empleado)

          const fullName = `${empleado.nombres} ${empleado.apellidos}`;
          localStorage.setItem('username', empleado.username!);
          localStorage.setItem('fullname', fullName);
          localStorage.setItem('rol', empleado.tipoEmpleado!);

          swall.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            text: `${fullName} ha iniciado sesión como ${empleado.tipoEmpleado}`,
            confirmButtonColor: '#0275d8',
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/dashboard']);
            }
          });
        },
        error => {
          swall.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: 'Credenciales incorrectas. Por favor, intenta de nuevo.'
          });
        }
      );
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
