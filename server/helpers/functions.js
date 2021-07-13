
const sendmail = async (email,subject,htmlText)=>{
    try {

        "use strict";
        const nodemailer = require("nodemailer");

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, 
            auth: {
            user: "jdcoder007@gmail.com", 
            pass: "jdcodersecondary@007", 
            },
        });

        let info = await transporter.sendMail({
            from: '"Reseller Bazar" <jdcoder007@gmail.com>', 
            to: email, 
            subject: subject, 
            html: htmlText, 
        });

        if(info.messageId){
            return "Sent";
        }else{
            return "Not Sent";
        }

    } catch (error) {
        return error;
    }
}

module.exports = {sendmail};