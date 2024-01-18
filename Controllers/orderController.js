const Order = require("../Models/orderSchema");
const Product = require("../Models/productSchema");
const ErrorHander = require("../utils/errorHandler");
const catchAsyncErrors = require("../Middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

// Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,

  });

  res.status(201).json({
    success: true,
    order
  });
});

// get Single Order 
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate( "user","name email");


  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order
  });
});

//  get logged in user  Orders  
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders
  })
});

// get all Orders => // api/v1/orders/admin/me

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Process Order Status -- Admin /api/v1/order
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === 'Delivered') {
    return next (new ErrorHander('You have already delivered this order',400))
  }

  order.orderItems.forEach( async item => {
    await updateStock(item.product , item.quantity)
  })

  order.orderStatus = req.body.status,
  order.deliveredAt = Date.now();

  await order.save()

  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id) ;

  product.stock = product.stock - quantity
  console.log("After Update - Stock:", product.stock);

  await product.save( {validateBeforeSave:false})
}



// delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  await order.deleteOne();
  console.log(`Order with ID ${req.params.id} has been deleted.`);

  res.status(200).json({
    success: true,
  });
});