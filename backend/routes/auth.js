const { body, validationResult } = require('express-validator');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const { fetchuser, isAdmin } = require('../Middleware/authMiddleware');
const router = express.Router();


// @desc    Create a User ( No login required )
// @route   POST /api/users/register
// @access  Public (users, admin)
router.post('/register', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: 'Sorry, a user with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Save user with role (default to "User" if not provided)
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            role: req.body.role || 'User',
        });

        await user.save();

        // JWT token generation
        const data = {
            user: {
                _id: user._id  // Ensure that you're using _id, which is the actual field name
            }
        };

        const authToken = jwt.sign(data, process.env.JWT_SECRET);  // Signing the token with the user data

        // Returning user data and token
        res.status(201).json({ 
            success: true, // Explicit success field
            authToken, 
            user: { 
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role 
            } 
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

// @desc    Authenticate a User 
// @route   POST /api/users/login 
// @access  Public (users, admin) 
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        console.log("user found:", user); // Consider removing in production
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' }); // Generic error message
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Invalid credentials' }); // Generic error message
        }

        // If successful, generate JWT
        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, process.env.JWT_SECRET);

        // Returning token and user info (without password)
        res.json({ 
            success: true, // Explicit success field
            authToken,
            user: { 
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role 
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

// @desc    Get loggedin User Details ( Login required )
// @route   POST /api/users/getuser 
// @access  Public (users, admin) 
router.get('/getuser', fetchuser, async (req, res) => { // Changed to GET
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        // Check if user is found
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user }); // Standardized response format
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

// @desc    Update user role
// @route   PUT /api/users/update-role/:id
// @access  Admin
router.put('/update-role/:id', fetchuser, isAdmin, [
    body('role', 'Role must be either "User" or "Admin"').isIn(['User', 'Admin']),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const userId = req.params.id; // Get the user ID from the request parameters

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user's role
        user.role = role;
        await user.save();

        res.json({ success: true, message: 'User role updated successfully', user });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

router.post('/resources', (req, res) => {
    res.json({ success: true });
  });
  

module.exports = router;
