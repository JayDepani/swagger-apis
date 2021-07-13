const router = require('express').Router();
const Userdata = require('../modules/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OtpDetails = require('../modules/otp_modules');
const functions = require('../helpers/functions');

/**
 * @swagger
 * components:
 *   schemas:
 *     SignUp:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *         - password
 *         - cpassword
 *       properties:
 *         id:
 *           type: string
 *           description: user Id
 *         name:
 *           type: string
 *           description: user name
 *         email:
 *           type: string
 *           description: user email
 *         phone:
 *           type: number
 *           description: user phone no
 *         password:
 *           type: string
 *           description: user password
 *         cpassword:
 *           type: string
 *           description: user cpassword
 *       example:
 *         name: Your Name
 *         email: example@gmail.com
 *         phone: Your Phone No
 *         password: xyz
 *         cpassword: xyz
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SignIn:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: user email
 *         password:
 *           type: string
 *           description: user password
 *       example:
 *         email: example@gmail.com
 *         password: xyz
 */

/**
 * @swagger
 * components:
 *      schemas:
 *          ForgotPassword:
 *              type: object
 *              required:
 *                  - email
 *              properties:
 *                  email:
 *                      type: string
 *                      description: User Email Id
 *              example:
 *                  email: example@gmail.com
 */

/**
 * @swagger
 * components:
 *   schemas:
 *    ResetPassword:
 *       type: object
 *       required:
 *         - otp
 *         - email
 *         - password
 *         - cpassword
 *       properties:
 *         otp:
 *           type: string
 *           description: Forgot Password OTP
 *         email:
 *           type: string
 *           description: Your Email
 *         password:
 *           type: string
 *           description: Your password
 *         cpassword:
 *           type: string
 *           description: Your confirm password
 *       example:
 *          otp: 6 Digit OTP
 *          email: example@gmail.com
 *          password: xyz
 *          cpassword: xyz
 *         
 */

/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: User Authentication APIs 
 */

// verify token
function verifyToken(req,res,next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== "undefined"){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.status(403).json({"error":"Forbidden Error"});
    }
}

/**
 * @swagger
 * /users:
 *  get:
 *    summary: Returns the list of all the Users
 *    tags: [Authentication]
 *    responses:
 *       200:
 *          description: The list of the users
 *          content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                      $ref: "#/components/schemas/SignUp"
 *       403:
 *          description: Forbidden Error
 *       500:
 *          description: Try after some time due to server error
 *
 */

router.get('/users',verifyToken,async(req,res)=>{
    try {
        const verifyHeaderToken = jwt.verify(req.token,process.env.SECRET_KEY);
        if(verifyHeaderToken){
            const users = await Userdata.find();
            res.status(200).json(users);
        }else{
            res.status(403).json({"error":"Forbidden Error"});
        }
    } catch (error) {
        res.status(500).json({"error":"Try after some time due to server error"});
    }
})

/**
 * @swagger
 * /signUp:
 *  post:
 *   summary: Create a new Account for Access all APIs
 *   tags: [Authentication]
 *   requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: "#/components/schemas/SignUp" 
 *   responses:
 *      200:
 *          description: Your Account Created Successfully
 *          contens:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/SignUp"
 *      400:
 *          description: Please enter valid Email or Password
 *      500:
 *          description: Your account not created due to server error
 */

router.post('/signUp',async(req,res)=>{
    try {

        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        let password = req.body.password; 
        let cpassword = req.body.cpassword; 

        if(name !='' && email !='' && phone!='' && password!='' && cpassword!=''){

            
            const verifyEmail = await Userdata.find({email});
            console.log(verifyEmail);
            if(verifyEmail!=''){
                res.status(204).json({"error":"Please enter valid Email or Password"});
            }else{
                if(password === cpassword){
                    password = await bcrypt.hash(password,10);
                    cpassword = await bcrypt.hash(cpassword,10);
                    
                    const usersSchema = new Userdata({
                    name:req.body.name,
                    email:email,
                    phone:req.body.phone,
                    password:password,
                    cpassword:cpassword
                })
                
                const result = await usersSchema.save();
                
                if(result!=''){
                    res.status(201).json({"error":"Your Account Created Successfully"});
                }else{
                    res.status(500).json({"error":"Your account not created due to server error"});
                }
            }else{
                res.status(400).json({"error":"Please enter valid Email or Password"});
            }
        }
    }else{
        res.status(400).json({"error" : "Please enter valid Registration Details"});
    }
    } catch (error) {
        res.status(500).json({"error":"Your account not created due to server error"});
    }
})

/**
 * @swagger
 * /signIn:
 *  post:
 *   summary: Login to your Account and Get JWT Auth Token
 *   tags: [Authentication]
 *   requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: "#/components/schemas/SignIn" 
 *   responses:
 *      200:
 *          description: Login successfully
 *          contens:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/SignIn"
 *      400:
 *          description: Please enter valid Login Details
 *      500:
 *          description: Login after some time due to server error
 */

router.post('/signIn',async(req,res)=>{
    try {

        const email = req.body.email;
        const password = req.body.password;
        if(email!='' && password!=''){
            const isEmail = await Userdata.findOne({email});
            if(isEmail!=''){
                const verifyPassword = await bcrypt.compare(password,isEmail.password);
                if(verifyPassword){
                    const token = await isEmail.generateAuthToken();
                    res.status(200).json({"authToken":`${token}`,"message":"Login Successfully"});
                }else{
                    res.status(400).json({"error" : "Please enter valid Login Details"});   
                }
            }else{
                res.status(400).json({"error" : "Please enter valid Login Details"});   
            }

        }else{
            res.status(400).json({"error" : "Please enter valid Login Details"});
        }
    } catch (error) {
        res.status(500).json({"error" : "Login after some time due to server error"});
    }
})


/**
 * @swagger
 * /forgotpassword:
 *      post:
 *        summary: Forgot Password
 *        tags: [Authentication]
 *        requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/ForgotPassword"   
 *        responses:
 *          201:
 *              description: OTP Send Successfully To Your Register Email
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ForgotPassword'
 *          400:
 *              description: Please enter valid Email
 *          500:
 *              description: Forgot Password after some time due to server error
 */

router.post('/forgotpassword',async(req,res)=>{
    try {
        const email = req.body.email;
        if(email!=''){
            const verifyEmail = await Userdata.findOne({email});
            if(verifyEmail!=''){
                const otp = Math.floor((Math.random()*1000000) + 1);
                const emailIsExistOrNot = await OtpDetails.findOne({email});
                let result = '';
                if(emailIsExistOrNot == null){
                    const otpSchema = new OtpDetails({
                        email,otp,expireIn: new Date().getTime() + 180 * 1000 
                    })
                    result = await otpSchema.save();
                }else{
                    result = await OtpDetails.updateOne({email},{$set:{otp,expireIn: new Date().getTime() + 180 * 1000}});
                }
                if(result!=''){
                    const subject = "Forgot Password OTP";
                    const htmlText = `<h4>Your OTP is: ${otp}</h4><p>OTP will be expire in <strong>Three </strong>Minites</p>`;
                    const sendmail = await functions.sendmail(email,subject,htmlText);
                    if(sendmail=="Sent"){
                        res.status(201).json({"message":"Check your register email for OTP","warning":"OTP will be expire in three minites"});
                    }else{
                        res.status(500).json({"error" : "Forgot Password after some time due to server error"});
                    }
                }else{
                    res.status(500).json({"error" : "Forgot Password after some time due to server error"});
                }
                
            }else{
                res.status(400).json({"error" : "Please enter valid Email"});
            }
        }else{
            res.status(400).json({"error" : "Please enter valid Email"});
        }

    } catch (error) {
        res.status(500).json({"error" : "Forgot Password after some time due to server error"});
    }
})

/**
 * @swagger
 * /resetpassword:
 *      post:
 *        summary: Reset Password
 *        tags: [Authentication]
 *        requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/ResetPassword"   
 *        responses:
 *          201:
 *              description: Your Password Updated Successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ResetPassword'
 *          400:
 *              description: Please enter valid Details
 *          500:
 *              description: Reset Password after some time due to server error
 */

 router.post('/resetpassword',async(req,res)=>{
    try {
        const otp = req.body.otp;
        const email = req.body.email;
        let password = req.body.password;
        let cpassword = req.body.cpassword;
        if(email!='' && otp!='' && password!='' && cpassword!='' && password === cpassword){
            const verifyEmail = await Userdata.findOne({email});
            const emailIsExistOrNot = await OtpDetails.findOne({email});
            if(verifyEmail!='' && emailIsExistOrNot!=''){
                
                if(otp==emailIsExistOrNot.otp){
                    const currentTime = new Date().getTime();
                    const otpIsValid = emailIsExistOrNot.expireIn - currentTime;
                    if(otpIsValid>0){
                        password = await bcrypt.hash(password,10);
                        cpassword = await bcrypt.hash(cpassword,10);
                        const result = await Userdata.updateOne({email},{$set:{password,cpassword}});
                        if(result!=''){
                            res.status(201).json({"message":"Your Password Updated Successfully"});
                        }else{
                            res.status(500).json({"error" : "Reset Password after some time due to server error"});
                        }
                    }else{
                        res.status(400).json({"error" : "Your OTP is expired"});
                    }
                }else{
                    res.status(400).json({"error" : "Please enter valid details"});
                }
            }else{
                res.status(400).json({"error" : "Please enter valid details"});
            }
        }else{
            res.status(400).json({"error" : "Please enter valid details"});
        }

    } catch (error) {
        res.status(500).json({"error" : "Reset Password after some time due to server error"});
    }
})


/**
 * @swagger
 * /logout:
 *  patch:
 *   summary: Logout From Your Account
 *   tags: [Authentication]
 *   responses:
 *      200:
 *          description: Logout Successfully
 *      403:
 *          description: Forbidden Error
 *      500:
 *          description: Logout  after some time due to server error
 */

 router.patch('/logout',verifyToken,async(req,res)=>{
    try {
        const verifyHeaderToken = jwt.verify(req.token,process.env.SECRET_KEY);
        if(verifyHeaderToken){
            const userDetails = jwt.decode(req.token);
            const result = await Userdata.findByIdAndUpdate({_id:userDetails._id},{$set:{tokens:[],__v:0}});
            if(result!=''){
                res.status(200).json({"message":"Logout Successfully"});
            }else{
                res.status(500).json({"error" : "Logout after some time due to server error"});
            }
        }else{
            res.status(403).json({"error" : "Forbidden Error"});
        }
    } catch (error) {
        res.status(500).json({"error" : "Logout after some time due to server error"});
    }
})

/**
 * @swagger
 * /deleteaccount:
 *  delete:
 *   summary: Delete Your Account
 *   tags: [Authentication]
 *   responses:
 *      200:
 *          description: Your Account Deleted Successfully
 *      403:
 *          description: Forbidden Error
 *      500:
 *          description: Delete Your Account after some time due to server error
 */


router.delete('/deleteaccount',verifyToken,async(req,res)=>{
    try {
        const verifyHeaderToken = jwt.verify(req.token,process.env.SECRET_KEY);
        if(verifyHeaderToken){
            const userDetails = jwt.decode(req.token);
            const result = await Userdata.findByIdAndDelete({_id:userDetails._id});
            const verifyEmail = await OtpDetails.findOne({email:result.email}); 
            if(verifyEmail!=''){
                await OtpDetails.findByIdAndDelete({_id:verifyEmail._id});
            }
            if(result!=''){
                res.status(200).json({"message":"Your Account Deleted Successfully"});
            }else{
                res.status(500).json({"error" : "Delete Your Account after some time due to server error"});
            }
        }else{
            res.status(403).json({"error" : "Forbidden Error"});
        }

    } catch (error) {
        res.status(500).json({"error" : "Delete Your Account after some time due to server error"});
    }
})








module.exports = router;