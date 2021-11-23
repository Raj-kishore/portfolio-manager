import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { ListRoutingModule } from './list-routing.module';
import { ListComponent } from './components/list.component';

//angular material
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {MatTableModule} from '@angular/material/table';


const routes: Routes = [
  {
    path: '',
    component: ListComponent
  }
];

@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ListRoutingModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatTableModule
  ],
  exports: [RouterModule]
})
export class ListModule { }
