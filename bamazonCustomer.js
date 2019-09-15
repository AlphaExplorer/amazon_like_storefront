var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazon"
  });

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  afterConnection();
});

function afterConnection() 
{
  connection.query('SELECT item_id, product_name, price FROM Products', function (error, results) {
    if (error) throw error;

    for (item of results)
    {
      console.log(item.item_id, item.product_name, item.price);
    };

    inquirer
      .prompt([
        {
          type: "input",
          name: "itemID",
          message: "Please enter the id of the item you would like to buy: "
        },
        {
          type: "input",
          name: "quantityRequested",
          message: "How many do you want to buy?"
        }
      ]).then(function(user) {

        connection.query({
          sql: 'SELECT item_id, product_name, price, stock_quantity FROM Products where item_id = ?',
          values: [user.itemID]}, 
          function (error, results) {
            if (error) throw error;
            
            for (item of results) 
            {
              let newQuantity = parseFloat(item.stock_quantity - user.quantityRequested);
              if (newQuantity >= 0) 
              {
                connection.query({
                  sql: 'UPDATE Products SET stock_quantity = ? WHERE item_id = ?',
                  values: [newQuantity, user.itemID]}, 
                  function(error, results) {
                    if (error) throw error;
                    console.log('Thank you for your purchase. Your total is $' + (item.price * user.quantityRequested).toFixed(2));
                });
              }
              else
              {
                console.log('Insufficient quantity!')
              }
            }
            connection.end();
          });
      });
  });
}