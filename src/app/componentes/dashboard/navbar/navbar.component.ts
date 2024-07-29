import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  nombreCompleto: string | null = '';
  rol: string | null = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.nombreCompleto = localStorage.getItem('fullname');
    this.rol = localStorage.getItem('rol');
  }

  logOut() {

    localStorage.removeItem('username');
    localStorage.removeItem('fullname');
    localStorage.removeItem('rol');

    this.router.navigate(['/tomar-asistencia']);
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('sidebar-hidden');
    }
  }
}
