const express = require('express');
const User = require('../models/Users');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../Middleware/authMiddleware')
const router = express.Router();


// Create new user route
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

// Users login route
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

// Get all users route
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

