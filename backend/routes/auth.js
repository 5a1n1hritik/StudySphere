// const express = require('express')
// const User = require('../models/Users')
// const jwt = require('jsonwebtoken');
// const router = express.Router()
// const fetchuser = require('../Middleware/authMiddleware')


// router.get('/createuser',async (req,res)=>{
//     const { name, email, password } = req.body;
//     try {
//       const user = await User.create({ name, email, password });
//       res.status(201).json({ token: generateToken(user._id) });
//     //   res.status(201).json(user);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
// })


// router.post('/login',async (req,res)=>{
//     const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (user && (await user.matchPassword(password))) {
//     res.json({ token: generateToken(user._id) });
//   } else {
//     res.status(401).json({ error: 'Invalid credentials' });
//   }
// })

// "todo" // create after some time 
// // router.post('/getuser', protect, async (req, res) => {
// //     try {
// //       // Send the user's details from the JWT payload (retrieved in protect middleware)
// //       res.json({
// //         id: req.user._id,
// //         name: req.user.name,
// //         email: req.user.email,
// //         role: req.user.role,
// //         enrolledCourses: req.user.enrolledCourses,
// //       });
// //     } catch (error) {
// //       // Log the error and send an internal server error response
// //       console.error('Error retrieving user profile:', error.message);
// //       res.status(500).json({ message: 'Error retrieving user profile' });
// //     }
// //   });
  
// // Route to get user details
// router.post('/getuser', fetchuser, async (req, res) => {
//     try {
//       const user = await User.findById(req.user.id).select('-password');
//       if (!user) {
//         return res.status(404).json({ success: false, message: 'User not found' });
//       }
      
//       // Return user data excluding sensitive information
//       res.json({
//         success: true,
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email
//         }
//       });
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
//   });




// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   };


// module.exports = router


const express = require('express');
const User = require('../models/Users');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../Middleware/authMiddleware')
const router = express.Router();

router.post('/register', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let user = await User.findOne({email: req.body.email});
        if (user) {
            return res.status(400).json({error:'Sorry a user with this email already exists'})
        }

        const salt = await bcrypt.genSalt(10);
        const secpss = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secpss,
        });
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data,process.env.JWT_SECRET);
        // res.json(user);
        res.json({authtoken});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    };
    const {email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({error:'Please try to login with correct credentials'})
        };
        const psscompare = await bcrypt.compare(password, user.password);
        if (!psscompare) {
            return res.status(400).json({error:'Please try to login with correct credentials'})
        };
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data,process.env.JWT_SECRET);
        res.json({authtoken});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

router.post('/getuser', fetchuser ,async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});
module.exports = router

