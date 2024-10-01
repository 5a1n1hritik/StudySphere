const express = require('express');
const router = express.Router();
const Course = require("../models/Course"); // Assuming you have a Course model
var { fetchuser, isAdmin} = require('../Middleware/authMiddleware');
// var { isAdmin } = require('../Middleware/isAdmin').default;


// Get all courses
router.get('/fetchallCourses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single course by ID
router.get('/singleCourse:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new course (protected route admin only)
// router.post('/addcourse', isAdmin,fetchuser, async (req, res) => {
//   const { title, description, price, category, level } = req.body;

//   try {
//     const newCourse = new Course({
//       title,
//       description,
//       price,
//       category,
//       level,
//     });
//     await newCourse.save();
//     res.status(201).json(newCourse); // Return the newly created course
//   } catch (error) {
//     res.status(500).json({ message: "Server error" }); // Handle any server errors
//   }
// });


// Route protected with 'fetchuser' middleware to ensure only authenticated users can access it
router.get('/mycourses', fetchuser, async (req, res) => {
  // Here, req.user contains authenticated user info
  // Fetch the courses belonging to the authenticated user
  try {
    const courses = await Course.find({ userId: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route protected with both 'fetchuser' and 'isAdmin' middleware to ensure only admins can create a course
router.post('/addcourse', fetchuser, isAdmin, async (req, res) => {
  const { title, description, price, category, level } = req.body;

  try {
    const newCourse = new Course({
      title,
      description,
      price,
      category,
      level,
    });
    await newCourse.save();
    res.status(201).json(newCourse); // Return the created course
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Update a course (protected route admin only)
router.put('/updateCourse:id', fetchuser, isAdmin, async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course (protected route admin only)
router.delete('/deleteCourse:id', fetchuser, isAdmin, async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
