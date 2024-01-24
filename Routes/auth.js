const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const auth = require("../middelwares/auth");
const User = require("../models/Users");
const nodemailer = require('nodemailer');
const OtpModel = require("../models/otpVerification");
const otpModel = require("../models/otpVerification");

router.post("/app/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ msg: "User with the same Email already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword,
      name,
    });

    user = await user.save();
    const token = jwt.sign({id : user._id},"PasswordKey");
     res.json({token,...user._doc});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


router.post("/app/login",async (req,res)=>{
   try{
     const {email ,password}=req.body;
     const user = await User.findOne({email});

     if(!user){
       return res.status(400).json({msg: "User with this Email doesn't Exits !"});
     }

     const isMatch = await bcryptjs.compare(password,user.password);

     if(!isMatch){
       return res.status(400).json({msg : "Incorrect Password"});
     }

     const token = jwt.sign({id : user._id},"PasswordKey");
     res.json({token,...user._doc});
   }
   catch(e){
    res.status(500).json({ error : e.message});
   }
});

router.post('/tokenIsVaild',async (req,res)=>{
   try{
      const token = req.header("x-auth-token");
      if(!token){
        return res.status(400).json({msg : "Error In Token"});
      }
      const verified = jwt.verify(token,"PasswordKey");
      if(!verified){
        return res.status(400).json({msg : "Error In Verified"});
      }
      const user = await User.findById(verified.id);
      if(!user) return res.status(400).json({msg : "Error In User"});
      res.json(true);
   }catch(e){
      res.status(500).json({error : "Invalid Token"})
   }
});


// get User 

router.get('/',auth,async (req,res)=>{
   const user = await User.findById(req.user);
   res.json({...user._doc,token : req.user});
});


// Email verification 
// Create a Nodemailer transporter


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "nodeprojectnode@gmail.com",
    pass: "hpka yilm zvbf xmjp",
  }
});


router.post('/SendOTP',async (req,res)=>{
  let user = User(req.body);
  
    if(!user.isEmail){

      const otp =  `${Math.floor(1000 + Math.random()*9000)}`

      var mailOptions = {
        from: 'nodeprojectnode@gmail.com',
        to: user.email,
        subject: 'Verify Your Email',
        html : `<p> Enter <b> ${otp} </b> in the app to verify your Email address and complete the verification </p>
        <p> This Code <b> Expires in 1 hours </b> </p>`
      };

      const UserOtp = new otpModel({
         userId : user.email,
         otp : otp,
         expiresAt : Date.now()+3600000,
      });
      
       await UserOtp.save();

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error sending email');
        } else {
          console.log('Email sent: ' + info.response);
          res.status(200).send('Email sent successfully');
        }
      });
    }
});


// Verification of OTP

router.post('/verification',async (req,res)=>{
 try {
   
  const {userId , otp } = req.body;

   if(!userId || !otp){
      throw Error("Enter Valid Details");
   }
    const UserOtpVerification = await otpModel.find({userId});
    
    if(UserOtpVerification.length <=0){
      throw Error("Account is Invalid or Recoard is Not founded ");
    }
    
    const expiresAt = UserOtpVerification[UserOtpVerification.length-1].expiresAt;
    const orginalOTP = UserOtpVerification[UserOtpVerification.length-1].otp;

    if(expiresAt < Date.now()){
      await otpModel.deleteMany({userId});
      throw Error("Otp Expiress, Please Requirest Again");
    }
    console.log(otp == orginalOTP);
    console.log(otp);
    console.log(orginalOTP);
    if(otp == orginalOTP){
      await User.updateOne({ email: userId }, { isEmail: true });
       await otpModel.deleteMany({userId});
       res.status(200).json({msg : "Email Verified"});
    } 
    throw Error("Email Not Verified");
 } catch (e) {
     res.status(400).json({msg : e.message});
 }
});

module.exports = router;