var express = require('express');
var router = express.Router();
// let path = require('../public/mock_data/Portfolios/portfolios.json');
var fs = require("fs");

/* GET portfolios listing. */
router.get('/', function (req, res, next) {
    //res.send(path.Portfolios);
    // fs.readFile(require('path').resolve('./') + "/Backend/public/mock_data/Portfolios/" + "portfolios.json", 'utf8', function (err, data) {
     fs.readFile(require('path').resolve('./') + "/public/mock_data/Portfolios/" + "portfolios.json", 'utf8', function (err, data) {
        if(err){
            console.log(err);
            next(err);
        }
        let list_data = JSON.parse(data);
        let formattedData = formatData(list_data.Portfolios);
        res.send(formattedData);
    });

});

router.post('/', function (req, res, next) {
    // requestoption
    // {
    //     "id":"2",
    //     "date":"2007-09-28"
    // }
    let portfolio_id = req.body.id;
    let portfolio_name = req.body.name;
    let portfolio_date = req.body.date;

    var fetch_portfolios = new Promise(function (resolve, reject) {
        let portfolio_id = req.body.id;
        // fs.readFile(require('path').resolve('./') + "/Backend/public/mock_data/Portfolios/" + "portfolios.json", 'utf8', function (err, data) {
        fs.readFile(require('path').resolve('./') + "/public/mock_data/Portfolios/" + "portfolios.json", 'utf8', function (err, data) {
  
            let portfoliolist_data = JSON.parse(data);
                portfoliolist_data.Portfolios
                .filter(item => item._Id === portfolio_id)
                .map((portfolio) => {
                    resolve(portfolio.Transactions);
                });
        });
    });

    var fetch_history = new Promise(function (resolve, reject) {
        // fs.readFile(require('path').resolve('./') + "/Backend/public/mock_data/Securities/" + "securities.json", 'utf8', function (err, res) {
       fs.readFile(require('path').resolve('./') + "/public/mock_data/Securities/" + "securities.json", 'utf8', function (err, res) {
  
           resolve(JSON.parse(res).Securities);
        });
    });

    Promise.all([fetch_portfolios, fetch_history]).then(values => {
        let transactions = values[0];
        let securities = values[1];
        //expectued API format
        // {
        //     "Portfolio": [
        //         {
        //             "_Id": "2",
        //             "Name": "Portfolio 2",
        //             "TotalPortfolioValue":"123213434.89",
        //             "Transactions": [
        //                 {
        //                     "SecurityId": "A",
        //                     "Type": "Buy",
        //                     "Shares":886.90,
        //                     "Amount": "10000",
        //                     "BuySellHistory":[
        //                          {
        //                              "Type": "Buy",
        //                              "Date": "2004-11-30",
        //                              "Amount": "10000",
        //                              "Shares":886.90,
        //                              "Price":12.33
        //                           },...
        //                      ]
        //                 },
        //                 {
        //                     "SecurityId": "B",
        //                     "Type": "Buy",
        //                     "Amount": "1000",
        //                     "Shares":886.90,,
        //                     "BuySellHistory":[
        //                           {
        //                               "Type": "Buy",
        //                               "Date": "2004-11-30",
        //                               "Amount": "10000",
        //                               "Shares":886.90,
        //                               "Price":12.33
        //                           },
        //                           {
        //                               "Type": "Sell",
        //                               "Date": "2004-11-30",
        //                               "Amount": "10000",
        //                               "Shares":886.90,
        //                               "Price":12.33
        //                           },...
        //                      ]
        //                 },...
        //             ]
        //         }
        //     ]
        // }

        let transactions_obj = [];


        //step 1
        //Fetch values of shares nearby date if for that date share price not available 
        //Calculate Shares and Price for each transactions
        transactions.map((item) => {
            securities_by_id = securities.filter(e => e._Id == item.SecurityId);
            let history = securities_by_id[0].HistoryDetail;
            security_value_by_date = history
                .filter(e => e.EndDate === item.Date);

            if (security_value_by_date.length === 0) {
                //using the most recent price prior to the date

                for (var i = 0; i < history.length; i++) {
                    var date1 = Date.parse(history[i].EndDate);
                    var date2 = Date.parse(item.Date);
                    let counter = 0;
                    if (date2 > date1) {
                        counter += 1;
                        if (counter <= 1) {
                            if (history.length === 0) {//with 1 elem
                                security_value_by_date = [{
                                    "EndDate": history[0].EndDate,
                                    "Value": history[0].Value
                                }]
                            } else if (i === history.length) {//incase pointer moved to the last
                                security_value_by_date = [{
                                    "EndDate": history[i - 1].EndDate,
                                    "Value": history[i - 1].Value
                                }]
                            } else {
                                security_value_by_date = [{
                                    "EndDate": history[i + 1].EndDate,
                                    "Value": history[i + 1].Value
                                }]
                            }

                        }
                    }

                }

            }
            let number_of_shares = item.Amount / security_value_by_date[0].Value;
            transactions_obj.push({
                "SecurityId": item.SecurityId,
                "Type": item.Type,
                "Date": security_value_by_date[0].EndDate,
                "Shares": number_of_shares,
                "Price": Number(security_value_by_date[0].Value).toFixed(2),
                "Amount": item.Amount
            });
        });

      

        //step 2
        //reduce transactions object
        //such that unique securities with gross shares
        var temp = [];

        ////circular reference: 
        //var temp_transcations = transactions_obj; transactions_obj is affected by changes in temp_transcations, because its circular as it refers to the same instance
        var temp_transcations = JSON.parse(JSON.stringify(transactions_obj)); //transactions_obj is NOT affected by changes in temp_transcations as it creates new instance

        //gross amount calculation
        temp_transcations.map((current, i) => {
            if (temp.length === 0) {
                temp.push(current)
            } else {
                let index = -1
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i].SecurityId === current.SecurityId) {
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    if (current.Type === 'Buy') {
                        let addValues = temp[index].Shares + current.Shares
                        temp[index].Shares = addValues
                    } else if (current.Type === 'Sell') {
                        let diffValues = temp[index].Shares - current.Shares
                        temp[index].Shares = diffValues
                    }
                } else {
                    temp.push(current)
                }
            }
        })

        //add history to each security
        temp.map((elem, index) => {
            let t = [];
            transactions_obj.map((item, i) => {
                if (elem.SecurityId === item.SecurityId) {
                    t.push(item)
                }
            })
            temp[index]['BuySellHistory'] = JSON.parse(JSON.stringify(t)) //circular in nature
        })


        //update securities with price for selected date and amount 
        temp.map( (x, i)=>{
            //get price
            var executed = false;
            let price = getPrice(portfolio_date, securities, x.SecurityId, executed);
            console.log("p >>> "+ JSON.stringify(price));
            console.log("------------------------------------------------");

            //update Price
            temp[i].Price = Number(price.Value).toFixed(2);

            //update Date 
            //update Price
            temp[i].Date = price.EndDate;


            //update amount
            temp[i].Amount = Number(price.Value*x.Shares).toFixed(2);
        });


        console.log(JSON.stringify(temp));


        //calculate gross value
        let gross = 0
        temp.map((x) => {
            gross += Number(x.Amount); 
        })



        let output = {
            Portfolio: {
                _Id: portfolio_id,
                Name: portfolio_name,
                Date: portfolio_date,
                TotalPortfolioValue: Number(gross).toFixed(2),
                Transactions: temp
            }
        }
        res.send(output);
    }).catch(function (e) {
        console.log('Error ' + e);
    });
});


function getPrice(date, securities, SecurityId, executed){
 
    console.log("d >>" + date);
   
    console.log("id >>" + SecurityId);
    securities_by_id = securities.filter(e => e._Id == SecurityId);
 
    let history = securities_by_id[0].HistoryDetail;

    security_value_by_date = history
        .filter(e => e.EndDate === date);
    
    // console.log("s >>" + JSON.stringify(security_value_by_date));

    if(security_value_by_date.length === 0){ //no price found for the date 
        let sorted_history = history.sort((x, y)=>{
            return new Date(x.EndDate) - new Date(y.EndDate); 
        });//ascending order by date

    
        let min_date = new Date(sorted_history[0].EndDate); 
        let max_date = new Date(sorted_history[sorted_history.length-1].EndDate);
        let selected_date = new Date(date);

        // console.log("min_date "+min_date);
        // console.log("max_date" + max_date);
        // console.log("selected_date "+selected_date);

        if(sorted_history.length > 1){
            //case 1 : if date is bigger than the max date 
            if(new Date(date) > max_date){
                //fetch from last date
                console.log("3 "+ JSON.stringify(sorted_history[sorted_history.length-1]));
                return sorted_history[sorted_history.length-1]; //max date
            }
            //case 2 :  if date is smaller than the min date
            if(new Date(date) < min_date){
                //fetch from last date
                console.log("4 "+  JSON.stringify(sorted_history[0]));
                return  sorted_history[0]; //min date
            }
            //case 3 : if date is between max date and min date 
            if(new Date(date)  <= max_date && new Date(date) >= min_date){
                //fetch from nearby values
                let obj = {}; 
                let executed = 0; 
                let estimated_security = {};
                //get the smallest diff
                sorted_history.map(x=>{
         
                    if(Object.keys(obj).length === 0){

                        obj = {
                            datepoint: x.EndDate,
                            time:Math.abs(new Date(x.EndDate) - new Date(date)),
                            value: x.Value
                        }
                      
                    }else{
                        let diff = Math.abs(new Date(x.EndDate) - new Date(date))
                        if(diff < obj.time){

                            obj.datepoint = x.EndDate;
                            obj.time = diff;
                            obj.value = x.Value;
                        
                        }else{
                              executed +=1;
                            if(executed === 1)
                            {
                                let return_obj = {
                                    "EndDate": obj.datepoint,
                                    "Value": obj.value
                                }; 
                                // console.log(JSON.stringify(return_obj));
                                estimated_security = return_obj;
                            }
                        }
                    }
                });
                return  estimated_security;
            }
        }else if(sorted_history.length === 1){
            console.log("2 "+ JSON.stringify(history[0]));
            return history[0]; //min date
        }
  
    }else{
        console.log("1 "+JSON.stringify(security_value_by_date[0]));
        return security_value_by_date[0]; 
    }
   
   // return estimated_security;
}



function formatData(data) {
    let portfolios = [];
    data.map((elem) => {
        portfolios.push(
            {
                "id": elem._Id,
                "name": elem.Name,
                "no_of_securites": [...new Set(elem.Transactions.map(item => item.SecurityId))].length,
                "last_modified": elem.Transactions.sort(function (a, b) {
                    return new Date(b.Date) - new Date(a.Date);
                })[0].Date
            }
        );
    });
    return portfolios;
}



module.exports = router;
