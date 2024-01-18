const Product = require("../Models/productSchema");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../Middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apifeatures");

// create new product => /api/v1/product/new

exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
88700
  res.status(201).json({
    success: true,
    product,
  });
});

//get all products  /api/v1/products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  
  const resPerPage = [];
  const productsCount = await Product.countDocuments();

  const apifeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resPerPage);

  const products = await apifeatures.query;

  res.status(200).json({
    success: true,
    message: "This route will show all Products",
    productsCount,
    products,
  });
});

//get single product details //api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found here ", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

//update Product /api/v1/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found here ", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// delete product /api/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found here ", 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product is deleted",
  });
});


// Create New Review or Update the review

exports.createProductReview = catchAsyncErrors(async(req, res, next) => {
  const  {rating , comment , productId} = req.body
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  }
  const product = await Product.findById(productId)
  console.log(product.reviews)

  const isReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  )
  if (isReviewed) {
    product.reviews.forEach( el => { 
      if(el.user.toString()) {
        el.comment = comment
        el.rating = rating
      }
      
    });

  }else {
    product.reviews.push(review) 
    product.numOfReviews = product.reviews.length
  }

  product.ratings = product.reviews.reduce((acc, item ) => item.rating + acc, 0) / product.reviews.length
  await product.save({validateBeforeSave: false})
  res.status(200).json({
    success:true
  })

})

//get product Reviews /api/v1/reviews 
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Product Review => /api/v1/reviews 
exports.deleteReview = catchAsyncErrors(async(req, res, next) => {
  const product = await Product.findById(req.query.productId)

  const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
  
  const numOfReviews = reviews.length

  product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
  
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings: product.ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
    res.status(200).json({
    success:true,
    reviews: product.reviews
  })
  console.log("Reviews deleted")
})


