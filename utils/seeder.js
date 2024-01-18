const dotenv = require('dotenv');
const connectDb = require('../Config/ConnectDb');
const Product = require('../Models/productSchema');

const products = require('../data/products')

dotenv.config();
connectDb();

const seedProducts = async () => {
    try {
        await Product.deleteMany();
        console.log('Products are deleted');

        await Product.insertMany(products); // Assuming 'products' is an array of sample product data
        console.log('All products are added');

        process.exit();
    } catch (error) {
        console.error(error.message);
        process.exit(1); // Exit with an error code
    }
};

seedProducts();
