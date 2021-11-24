var express = require('express');
var router = express.Router();
// let path = require('../public/mock_data/Portfolios/portfolios.json');
var fs = require("fs");

/* GET portfolios listing. */
router.get('/', function (req, res, next) {
    //res.send(path.Portfolios);
    // fs.readFile(require('path').resolve('./') + "/MEAN/Backend/public/mock_data/Portfolios/" + "portfolios.json", 'utf8', function (err, data) {
    fs.readFile(require('path').resolve('./') + "/public/mock_data/Portfolios/" + "portfolios.json", 'utf8', function (err, data) {
        if (err) {
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
        // fs.readFile(require('path').resolve('./') + "/MEAN/Backend/public/mock_data/Portfolios/" + "portfolios.json", 'utf8', function (err, data) {
        fs.readFile(require('path').resolve('./') + "/public/mock_data/Portfolios/" + "portfolios.json", 'utf8', function (err, data) {
            if (err) {
                console.log(err);
                next(err);
            }
            let portfoliolist_data = JSON.parse(data);
            portfoliolist_data.Portfolios
                .filter(item => item._Id === portfolio_id)
                .map((portfolio) => {
                    resolve(portfolio.Transactions);
                });
        });
    });

    var fetch_history = new Promise(function (resolve, reject) {
        // fs.readFile(require('path').resolve('./') + "/MEAN/Backend/public/mock_data/Securities/" + "securities.json", 'utf8', function (err, res) {
        fs.readFile(require('path').resolve('./') + "/public/mock_data/Securities/" + "securities.json", 'utf8', function (err, res) {
            if (err) {
                console.log(err);
                next(err);
            }
            resolve(JSON.parse(res).Securities);
        });
    });

    Promise.all([fetch_portfolios, fetch_history]).then(async (values) => {
        let transactions = values[0];
        let securities = values[1];
        let BuySellHistoryObj = [];

       
        //Fetch values of shares by date or nearby date
        //Calculate Shares and Price for each transactions
        BuySellHistoryObj = await transactionsObjectBuilder(transactions, securities);

     
        //reduce transactions object
        //show unique securities with total shares
        var TransactionsObj = [];

        //handle circular reference: 
        var newBuySellHistoryObjInstance = JSON.parse(JSON.stringify(BuySellHistoryObj)); //BuySellHistoryObj is NOT affected by changes in newBuySellHistoryObjInstance as it refers new instance

        //gross share calculation
        newBuySellHistoryObjInstance.map((current, i) => {
            if (TransactionsObj.length === 0) {
                TransactionsObj.push(current)
            } else {
                let index = -1
                for (var i = 0; i < TransactionsObj.length; i++) {
                    if (TransactionsObj[i].SecurityId === current.SecurityId) {
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    if (current.Type === 'Buy') {
                        let addValues = TransactionsObj[index].Shares + current.Shares
                        TransactionsObj[index].Shares = addValues
                    } else if (current.Type === 'Sell') {
                        let diffValues = TransactionsObj[index].Shares - current.Shares
                        TransactionsObj[index].Shares = diffValues
                    }
                } else {
                    TransactionsObj.push(current)
                }
            }
        })

        //add history to each security
        TransactionsObj.map((elem, index) => {
            let record = [];
            BuySellHistoryObj.map((item, i) => {
                if (elem.SecurityId === item.SecurityId) {
                    record.push(item)
                }
            })
            TransactionsObj[index]['BuySellHistory'] = JSON.parse(JSON.stringify(record)) //circular in nature
        })


        //update securities with amount and price for selected date or near by date if date not present in securities data 
        TransactionsObj.map((security, index) => {

            //get price
            let priceOnj = getPrice(portfolio_date, securities, security.SecurityId);

            //update Price
            TransactionsObj[index].Price = Number(priceOnj.Value).toFixed(2);

            //update Date 
            TransactionsObj[index].Date = priceOnj.EndDate;

            //update amount
            TransactionsObj[index].Amount = Number(priceOnj.Value * security.Shares).toFixed(2);
        });


        //calculate gross value
        let Gross = 0;
        TransactionsObj.map((elem) => {
            Gross += Number(elem.Amount);
        })


        let PortfolioObj = {
            Portfolio: {
                _Id: portfolio_id,
                Name: portfolio_name,
                Date: portfolio_date,
                TotalPortfolioValue: Number(Gross).toFixed(2),
                Transactions: TransactionsObj
            }
        }
        res.send(PortfolioObj);
    }).catch(function (e) {
        console.log('Error ' + e);
    });
});

function transactionsObjectBuilder(transactions, securities) {
    return new Promise(resolve => {
        let transactions_obj = [];
        transactions.map((item) => {
            let price = getPrice(item.Date, securities, item.SecurityId);
            security_value_by_date = [price];
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
        resolve(transactions_obj);
    });
}

function getPrice(date, securities, SecurityId) {

    securities_by_id = securities.filter(e => e._Id == SecurityId);
    let history = securities_by_id[0].HistoryDetail;
    security_value_by_date = history
        .filter(e => e.EndDate === date);

    if (security_value_by_date.length === 0) { //find nearest date price
        let sorted_history = history.sort((x, y) => {
            return new Date(x.EndDate) - new Date(y.EndDate);
        });//ascending order by date

        let min_date = new Date(sorted_history[0].EndDate);
        let max_date = new Date(sorted_history[sorted_history.length - 1].EndDate);
        if (sorted_history.length > 1) {
            //case 1 : if date is bigger than the max date 
            if (new Date(date) > max_date) {
                //fetch from last date
                return sorted_history[sorted_history.length - 1]; //max date
            }
            //case 2 :  if date is smaller than the min date
            if (new Date(date) < min_date) {
                //fetch from last date
                return sorted_history[0]; //min date
            }
            //case 3 : if date is between max date and min date 
            if (new Date(date) <= max_date && new Date(date) >= min_date) {
                //fetch from nearby values
                let obj = {};
                let executed = 0;
                let estimated_security = {};
                //get the smallest diff
                sorted_history.map(x => {

                    if (Object.keys(obj).length === 0) {

                        obj = {
                            datepoint: x.EndDate,
                            time: Math.abs(new Date(x.EndDate) - new Date(date)),
                            value: x.Value
                        }

                    } else {
                        let diff = Math.abs(new Date(x.EndDate) - new Date(date))
                        if (diff < obj.time) {

                            obj.datepoint = x.EndDate;
                            obj.time = diff;
                            obj.value = x.Value;

                        } else {
                            executed += 1;
                            if (executed === 1) {
                                let return_obj = {
                                    "EndDate": obj.datepoint,
                                    "Value": obj.value
                                };

                                estimated_security = return_obj; //value as per nearest date 
                            }
                        }
                    }
                });
                return estimated_security;
            }
        } else if (sorted_history.length === 1) {

            return history[0]; //min date
        }

    } else {
        return security_value_by_date[0];
    }

}


function formatData(data) {
    let portfolios = [];
    data.map((elem) => {
        portfolios.push(
            {
                "id": elem._Id,
                "name": elem.Name,
                "no_of_securites": [...new Set(elem.Transactions.map(item => item.SecurityId))].length,
                "last_modified": elem.Transactions.sort(function (prev, next) {
                    return new Date(prev.Date) - new Date(next.Date);
                })[0].Date
            }
        );
    });
    return portfolios;
}


module.exports = router;
