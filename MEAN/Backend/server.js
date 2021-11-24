//server.js
const app = require("./app");

app.listen(5000, function () {
  console.log("server is running on port 5000");
});

module.exports = app;
