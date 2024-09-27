const express = require('express');
const router = express.Router();
const Course = require("../models/course"); // Assuming you have a Course model
var { fetchuser, verifyAdmin } = require('../Middleware/authMiddleware');


// router.get("/getCourses", async (req, res) => {
//   try {
//     const courses = await Course.find().populate("instructor");
//     res.json(courses);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// router.get("/getCourse", async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id).populate("instructor");
//     res.json(course);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// router.get("/createCourse", async (req, res) => {
//     const { title, description, curriculum } = req.body;
//   try {
//     const course = new Course({ title, description, instructor: req.user._id, curriculum });
//     await course.save();
//     res.status(201).json(course);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });




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
// router.post('/', fetchuser,verifyAdmin, async (req, res) => {
//   const { title, description, price, category, level } = req.body;
//   try {
//     const newCourse = new Course({ title, description, price, category, level });
//     await newCourse.save();
//     res.status(201).json(newCourse);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

router.post('/addcourse', verifyAdmin,fetchuser, async (req, res) => {
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
    res.status(201).json(newCourse); // Return the newly created course
  } catch (error) {
    res.status(500).json({ message: "Server error" }); // Handle any server errors
  }
});


// Update a course (protected route admin only)
router.put('/updateCourse:id', fetchuser, verifyAdmin, async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course (protected route admin only)
router.delete('/deleteCourse:id', fetchuser, verifyAdmin, async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
