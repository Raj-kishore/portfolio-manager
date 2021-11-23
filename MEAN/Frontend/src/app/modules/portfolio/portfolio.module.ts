import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioComponent } from './components/portfolio.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

const routes: Routes = [
  {
    path: '',
    component: PortfolioComponent
  }
];

@NgModule({
  declarations: [
    PortfolioComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    PortfolioRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  exports: [RouterModule],
  providers: [  
    MatDatepickerModule,  
  ]
})
export class PortfolioModule { }
