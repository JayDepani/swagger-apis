const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    expireIn: {
        type: Number
    }
})

const OtpDetails = new mongoose.model("otp", otpSchema);

module.exports = OtpDetails;