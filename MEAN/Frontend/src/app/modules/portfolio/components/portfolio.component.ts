import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { FormControl } from '@angular/forms'
import { ApiCommonService } from 'src/app/services/api-common.service'

export interface type {
  id: number
  text: string
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      )
    ])
  ]
})
export class PortfolioComponent implements OnInit {
  isPageLoaded:boolean = false ; 
  portfolio_index: number | undefined;
  total_portfolio_value: number | undefined; 
  ELEMENT_DATA: PeriodicElement[] = [];
  dataSource:any;
  date = new FormControl(new Date());
  columnsToDisplay = ['SecurityId', 'Date', 'Shares', 'Price', 'Amount']

  expandedElement: PeriodicElement | null | undefined

  // transactions = [
  //   {
  //     SecurityId: 'A',
  //     Type: 'Buy',
  //     Date: '2004-11-30',
  //     Shares: 885.7395925597875,
  //     Price: '11.29',
  //     Amount: '10000'
  //   },
  //   {
  //     SecurityId: 'B',
  //     Type: 'Buy',
  //     Date: '2005-05-12',
  //     Shares: 26.107635879917517,
  //     Price: '38.302970234437',
  //     Amount: '1000'
  //   },
  //   {
  //     SecurityId: 'C',
  //     Type: 'Buy',
  //     Date: '"2005-06-30"',
  //     Shares: 15.267175572519085,
  //     Price: '65.5',
  //     Amount: '1000'
  //   },
  //   {
  //     SecurityId: 'B',
  //     Type: 'Sell',
  //     Date: '2006-08-21',
  //     Shares: 9.191310930439828,
  //     Price: '54.3992041814294',
  //     Amount: '500'
  //   },
  //   {
  //     SecurityId: 'C',
  //     Type: 'Buy',
  //     Date: '"2006-08-31"',
  //     Shares: 26.76659528907923,
  //     Price: '74.72',
  //     Amount: '2000'
  //   }
  // ]

  temp = [] as any
  portfolio_id: any
  appliedDate: string | undefined

  constructor (private api: ApiCommonService, public route: ActivatedRoute) {}

  ngOnInit (): void {
 
    this.route.queryParams.subscribe(params => {
      this.portfolio_index = params['name'];
      this.portfolio_id = params['id'];
    })

    console.log(">>> ");
    console.log(this.dataSource);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    this.appliedDate = mm + '/' + dd + '/' + yyyy; 
    
    //load data for first time (applying today's date)
    this.api
    .getTransactions({
      id: this.portfolio_id,
      name: this.portfolio_index,
      date: this.dateFormatter(mm + '/' + dd + '/' + yyyy)
    })
    .subscribe(data => {

      this.ELEMENT_DATA = data.Portfolio.Transactions;
      this.dataSource = this.ELEMENT_DATA;
      this.total_portfolio_value = data.Portfolio.TotalPortfolioValue
  
    })

    // var temp_transcations = this.transactions
    // //gross amount calculation
    // temp_transcations.map((current, i) => {
    //   if (this.temp.length === 0) {
    //     this.temp.push(current)
    //   } else {
    //     let index = -1
    //     for (var i = 0; i < this.temp.length; i++) {
    //       if (this.temp[i].SecurityId === current.SecurityId) {
    //         index = i
    //         break
    //       }
    //     }
    //     if (index !== -1) {
    //       if (current.Type === 'Buy') {
    //         let addValues = this.temp[index].Shares + current.Shares
    //         this.temp[index].Shares = addValues
    //       } else if (current.Type === 'Sell') {
    //         let diffValues = this.temp[index].Shares - current.Shares
    //         this.temp[index].Shares = diffValues
    //       }
    //     } else {
    //       this.temp.push(current)
    //     }
    //   }
    // })

    // //add history to each security
    // this.temp.map((elem: any, index: any) => {
    //   let t = [] as any
    //   this.transactions.map((item, i) => {
    //     if (elem.SecurityId === item.SecurityId) {
    //       t.push(item)
    //     }
    //   })
    //   this.temp[index]['BuySellHistory'] = t
    // })

    // //calculate gross value
    // let gross = -1
    // this.temp.map((x: any) => {
    //   gross = x.Shares * x.Price
    // })

    // let output = {
    //   Portfolio: {
    //     _Id: 'portfolio_id',
    //     Name: 'portfolio_name',
    //     TotalPortfolioValue: gross,
    //     Transactions: this.temp
    //   }
    // }
    // console.log(output)
  }

  ngAfterViewInit()	{
    this.isPageLoaded = true ; 
  }


  handleFilter (value: any) {
    this.appliedDate = value; 
    this.api
      .getTransactions({
        id: this.portfolio_id,
        name: this.portfolio_index,
        date: this.dateFormatter(value)
      })
      .subscribe(data => {
        console.log(data);
        this.ELEMENT_DATA = data.Portfolio.Transactions;
        this.dataSource = this.ELEMENT_DATA;
        this.total_portfolio_value = data.Portfolio.TotalPortfolioValue
        console.log(this.dataSource);
      })
  }
  dateFormatter (value: any) {
    //input "11/30/2021"      MM/DD/YYYY
    //expected "2007-09-28"  YYYY-MM-DD
    console.log(value)
    let DD = value.split('/')[0]
    if (DD < 10) {
      DD = '0' + DD
    }
    let MM = value.split('/')[1]
    if (MM < 10) {
      MM = '0' + MM
    }
    let YYYY = value.split('/')[2]
    let expected_format = YYYY + '-' + DD + '-' + MM

    return expected_format
  }
}

export interface PeriodicElement {
  SecurityId: string
  Date: string
  Shares: number
  Price: number
  Amount: number
  BuySellHistory: LastTranctions
}
export interface LastTranctions {
  Type: string
  Date: string
  Shares: number
  Price: number
  Amount: number
  SecurityId: string
}


function moment (momentDate: Date) {
  throw new Error('Function not implemented.')
}
