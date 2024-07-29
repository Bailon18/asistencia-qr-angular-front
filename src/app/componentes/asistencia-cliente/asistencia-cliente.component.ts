import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asistencia-cliente',
  templateUrl: './asistencia-cliente.component.html',
  styleUrls: ['./asistencia-cliente.component.css']
})
export class AsistenciaClienteComponent {


  constructor(
    private router: Router
  ){

  }

  ingresarLogin(){
    this.router.navigate(['/tomar_asistencia/login']);
  }

}
