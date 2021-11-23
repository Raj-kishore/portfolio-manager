import { Component, OnInit } from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';

import { ApiCommonService } from '../../../services/api-common.service';
import {MatTableDataSource} from '@angular/material/table';

export interface Portfolio {
  name: string;
  no_of_securites: number;
  last_modified: Date;
}

const ELEMENT_DATA: Portfolio[] = [];
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  value = '';
  displayedColumns: string[] = ['name', 'no_of_securites', 'last_modified'];
  dataSource:any;
  constructor(private api: ApiCommonService,
    private router: Router
    ){

  }

  ngOnInit(): void {
    this.api.getPortfolios()
    .subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
    
      // for (const d of (data as any)) {
      //   this.smartphone.push({
      //     name: d.name,
      //     price: d.price
      //   });
      // }
      // console.log(this.smartphone);
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getTableItem(event: Event){
    console.log(event);
    let navigationExtras: NavigationExtras = {
      queryParams: event
    };
    this.router.navigate(['/transactions'],navigationExtras);
  }
}
