Node js : v16.13.0
Npm : 8.1.0
Express: 4.17.1
Angular : v13


to start angular (http://localhost:4200)
Project\MEAN\Frontend > ng s
ng s

to start nodejs (http://localhost:5000)
Project\MEAN\Backend > nodemon

nodemon
or nodemon app.js
or npm start
or node app.js

APIs
to get all portfolios
GET http://localhost:5000/portfolios
to get transaction details by portfolio id and date
POST http://localhost:5000/portfolios 
requestoptions:  
  {
        "id":"2",
        "date":"2007-09-28"
    }


