const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const crypto = require('crypto')

const userSchema = new mongoose.Schema({

    name: {
        type:String,
        require:[true, "Please Enter Your Name"],
        maxLength:[10, "item cannot exceed 10 characters"],
        minLength:[4, "Name should have more than 4 characters"]
    },
    email:{
        type:String,
        require:[true,"Please Enter Your Email"],
        unique:true,
        validate:[validator.isEmail, "Please enter a valid Email"]
    },
    password:{
        type:String,
        require: [true, "Please Enter Your Password"],
        minLength:[8, "Password should be greater than 8 characters"],
        select:false,
    },
    avatar:{
            public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
             required:true,
        }
    },
    role:{
        type:String,
        default: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    resetPasswordToken:String,
    resetPasswordExpire: Date
    
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10)
})


//JWT Token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME // Adjust the expiration time as needed
    });
  };
  
// compare password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

//GetReset PasswordToken
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    return resetToken


}
  

const User = mongoose.model('User', userSchema);

module.exports = User;

