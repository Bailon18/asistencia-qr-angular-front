import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/authGuard.service';
import { AdminGuard } from './shared/guards/adminguard.service';


const routes: Routes = [
  { path: '', redirectTo: 'tomar_asistencia', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./componentes/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard, AdminGuard] 
  },
  { path: 'tomar_asistencia', loadChildren: () => import('./componentes/asistencia-cliente/asistencia-cliente.module').then(m => m.AsistenciaClienteModule) },
  { path: '**', redirectTo: 'tomar_asistencia' }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
