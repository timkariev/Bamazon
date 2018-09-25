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
    managerOptions();
});


function managerOptions(){

    inquirer.prompt(
        {
            message: "Choose an option below:",
            type: "list",
            name: "option",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit" ]
        }
    ).then(function(answer){

        console.log(answer.option);

        switch(answer.option){
            case 'View Products for Sale':
                displayProducts(true);
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
            case 'Exit':
                return process.exit(22);

        }
    })



}



//Functions

function displayProducts(managerOps){
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

        if (managerOps) managerOptions();
        
    });

}

function lowInventory(){

    console.log("\n=========================\n");
    console.log("LOW INVENTORY".red)
    console.log("\n=========================\n");

    //SQL DB connection & display products to console
    connection.query("SELECT * FROM products", function(err, results) {

        if (err) throw err;

        let lowInv = false;

        for (var i = 0; i < results.length; i++) {
            // console.log(results[i].stock_quantity);
            if(results[i].stock_quantity < 5){

                lowInv = true;

                console.log('Item Number: ' + results[i].item_id);
                console.log('Product Name: ' + results[i].product_name);
                console.log('Price: $' + results[i].price)
                console.log('\n-----------\n');
            }
            
        }

        if (!lowInv){

            console.log("No low inventory\n\n".green);
        }

        managerOptions();

    });

}

function addInventory(){

    displayProducts(false);

    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        inquirer
        .prompt([
        {
            name: "product",
            type: "input",
            message: "Which item would you like to add inventory? (enter item number)"
        },
        {
            name: "quantity",
            type: "input",
            message: "How many units would you like to add?"
        }
        ])
        .then(function(answer) { 

            //Make sure the product exists 
            let exists = false;
            let index = 0;
            for (let i = 0; i < results.length; i++){
                if (parseInt(answer.product) === results[i].item_id){
                    exists = true;
                    index = i;
                }
            }

            //Display if item does not exist
            if (!exists) {
                console.log('\nOops! Item does not exist\n'.red);
                managerOptions();
                return;
            }

            //If it exists, see if the quantity is available 
            if (answer.quantity < 1){
                console.log("\nInvalid quantity!\n".red);
                managerOptions();
                return;
            }
            else{

                let newQuant = parseInt(results[index].stock_quantity) + parseInt(answer.quantity);
                
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
                    console.log("Inventory Added".green);
                    console.log("New Quantity: " + newQuant);
                    console.log("\n=========================\n\n");

                    managerOptions();
                    
                    }
                );
            }

        });
    });

}

function addProduct(){



    inquirer
    .prompt([
    {
        name: "product",
        type: "input",
        message: "Product Name: "
    },
    {
        name: "department",
        type: "input",
        message: "Department Name: "
    },
    {
        name: "price",
        type: "input",
        message: "Product Price: "
    },
    {
        name: "quant",
        type: "input",
        message: "Product Quantity: "
    },
    
    ])
    .then(function(answer) { 

        //Add the product
        connection.query(

            "INSERT INTO products SET ?",
            {
                product_name: answer.product,
                department_name: answer.department,
                price: parseInt(answer.price),
                stock_quantity: parseInt(answer.quant)
            },
            function(error) {
            if (error) throw error;

            console.log("\n=========================\n");
            console.log("Product Added".green);
            console.log("\n=========================\n\n");

            managerOptions();
            
            }
        );
    });






}