const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetNewPassword,
  logout,
  getUserProfile,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser
} = require("../Controllers/userController");

const { authUser, isManager } = require("../Middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetNewPassword);

router.get("/logout", logout);

//ADMIN ROUTES
router.get("/me", authUser, getUserProfile);
router.put("/password/update", authUser, updatePassword);
router.put("/me/update", authUser, updateProfile);

router.get("/admin/users", authUser,isManager('admin'), getAllUsers);
router.route('/admin/user/:id')
      .get(authUser, isManager('admin') , getSingleUser)
      .put(authUser, isManager('admin') , updateUserRole)
      .delete(authUser, isManager('admin') ,deleteUser )






module.exports = router;
