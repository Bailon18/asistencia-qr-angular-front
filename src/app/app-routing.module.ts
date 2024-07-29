import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TomaAsistenciaComponent } from './componentes/toma-asistencia/toma-asistencia.component';
import { LoginComponent } from './componentes/login/login.component';



const routes: Routes = [
  { path: '', redirectTo: 'tomar_asistencia', pathMatch: 'full' },
  { path: 'tomar_asistencia', component: TomaAsistenciaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', loadChildren: () => import('./componentes/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: '**', redirectTo: 'tomar_asistencia' }
]


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
