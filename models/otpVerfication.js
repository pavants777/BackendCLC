const mongoose = require("mongoose");

const otpVerificationSchema = mongoose.Schema({
     userId : String,
     otp : String,
     createdAt : String,
     expiresAt : String,
});


const otpVerification = mongoose.model(
    "OtpVerification",
    otpVerificationSchema
);

module.exports = otpVerification;