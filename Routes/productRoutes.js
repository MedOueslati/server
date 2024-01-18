const express = require("express");
const router = express.Router();

const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview
} = require("../Controllers/productController");
const { authUser, isManager } = require("../Middlewares/authMiddleware");

router.get("/products", getProducts);
router.get("/product/:id", getSingleProduct);

//@For Admin
router.post("/product/new", authUser, isManager("admin"), newProduct);
router
  .route("/admin/product/:id")
  .put(authUser, isManager("admin"), updateProduct)
  .delete(authUser, isManager("admin"), deleteProduct);

router.put("/review" ,authUser, createProductReview)
router.get("/reviews" ,authUser, getProductReviews)
router.delete("/reviews" ,authUser, deleteReview)





module.exports = router;
