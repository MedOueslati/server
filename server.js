const app = require('./app');
const dotenv = require("dotenv")
const connectDB = require('./Config/ConnectDb')
const cloudinary = require('cloudinary').v2


// Setting Up config file
dotenv.config()
//setting cloundinary
// console.log('CLOUDINARY_NAME:', process.env.CLOUDINARY_NAME);
// console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
// console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
  });

  
connectDB();

// @Setting up a constant for the server port
const port=process.env.PORT
// @Starting the Express server
app.listen(port, () => console.log("my server is running on port:",port))
