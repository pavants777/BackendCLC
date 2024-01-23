const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const auth = require("../middelwares/auth");
const User = require("../models/Users");

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

router.post('/EmailVerification',auth,async(req,res)=>{
  
});

module.exports = router;