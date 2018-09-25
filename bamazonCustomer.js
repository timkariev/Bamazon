var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');

let connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazon"
});
  
  // connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    displayProducts();
});



function displayProducts(){
    console.log("\n=========================\n");
    console.log("PRODUCTS".green)
    console.log("\n=========================\n");

    //SQL DB connection & display products to console
    connection.query("SELECT * FROM products", function(err, results) {

        if (err) throw err;

        for (var i = 0; i < results.length; i++) {
            console.log('Item Number: ' + results[i].item_id);
            console.log('Product Name: ' + results[i].product_name);
            console.log('Price: $' + results[i].price)
            console.log('\n-----------\n');
            }

            promptPurchase(results); //Gather info about what the user wants to do next
    });
}


function promptPurchase(productArray){

    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        inquirer
        .prompt([
        {
            name: "product",
            type: "input",
            message: "What would you like to purchase? (enter item number)"
        },
        {
            name: "quantity",
            type: "input",
            message: "How much would you like to buy?"
        }
        ])
        .then(function(answer) { 

            //Make sure the product exists 
            let exists = false;
            let index = 0;
            for (let i = 0; i < productArray.length; i++){
                if (parseInt(answer.product) === productArray[i].item_id){
                    exists = true;
                    index = i;
                }
            }

            //Display if item does not exist
            if (!exists) {
                console.log('\nOops! Item does not exist\n'.red);
                restartOrder();
                return;
            }

            //If it exists, see if the quantity is available 
            if (productArray[index].stock_quantity < answer.quantity){
                console.log("\nInsufficient quantity!\n".red);
                restartOrder();
                return;
            }
            else{

                let newQuant = productArray[index].stock_quantity - answer.quantity;
                
                //Uupdate the quantity 
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                    {
                        stock_quantity: newQuant
                    },
                    {
                        item_id: parseInt(answer.product)
                    }
                    ],
                    function(error) {
                    if (error) throw err;

                    console.log("\n=========================\n");
                    console.log("Transaction Successful".green);
                    console.log("You were charged $" + answer.quantity*productArray[index].price);
                    console.log("\n=========================\n\n");

                    restartOrder();
                    
                    }
                );
            }

        });
    });

}

//Function to ask if you want to restart the order
function restartOrder() {

    inquirer.prompt([
        {
            name: "restart",
            type: "input",
            message: "Do you want to purchase another product? (Y/N)"
        }
    ])
    .then(function(answer) 
    { 
        if (answer.restart === 'Y' || answer.restart === 'y'){
            console.log(answer.restart);
            displayProducts(); //Restart the application by displaying products
        }
        else{
            console.log("\n=========================\n");
            console.log("Thanks for shopping!");
            console.log("\n=========================\n");
            return process.exit(22);
        }

    });

}

