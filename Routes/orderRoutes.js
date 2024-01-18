const express = require("express");
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require("../Controllers/orderController")
const router = express.Router();
const { authUser, isManager } = require("../Middlewares/authMiddleware");

router.post("/order/new",authUser, newOrder);
router.get("/order/:id",authUser, getSingleOrder);
router.get("/orders/me",authUser, myOrders)
router
  .route("/admin/orders")
  .get(authUser, isManager("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(authUser, isManager("admin"), updateOrder)
  .delete(authUser, isManager("admin"), deleteOrder);
module.exports = router;
