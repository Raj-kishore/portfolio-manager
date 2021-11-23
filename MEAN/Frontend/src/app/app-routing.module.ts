import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [ //lazy loading of modules
  {
    path: 'list',
    loadChildren: () => import('./modules/list/list.module').then(m => m.ListModule)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./modules/portfolio/portfolio.module').then(m => m.PortfolioModule)
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
