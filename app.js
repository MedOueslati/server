const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const bodyparser = require("body-parser");
const fileUpload = require('express-fileupload');


const cors = require('cors');
const errorMiddleware = require('./Middlewares/errors');

const products = require ('./Routes/productRoutes')
const users = require ('./Routes/userRoutes')
const order = require("./Routes/orderRoutes")


app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(bodyparser.urlencoded({extended: true}));





// Define a route for the root endpoint "/"
app.get("/", (req, res) => {
    res.send("Api is running successfully...");
  });
  


// api/v1/Routes
app.use('/api/v1' , products)
app.use('/api/v1' , users)
app.use('/api/v1' , order)




//MiddleWare To handler errors
app.use(errorMiddleware);


module.exports = app;
