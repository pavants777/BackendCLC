const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        userId : 
        {
            type : String ,
            require : true,
        },
        otp :
        {
            type : String,
            require : true,
        },
        expiresAt :
        {
            type : String,
            default : Date.now(),
        },
    }
);

const otpModel = mongoose.model("OtpModel",otpSchema);

module.exports = otpModel;