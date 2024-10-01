const { check, validationResult } = require('express-validator');
const express = require("express");
const mongoose = require("mongoose");
const Question = require("../models/Question");
const Performance = require("../models/PerformanceSchema");
const { fetchuser, isAdmin } = require("../Middleware/authMiddleware");

const router = express.Router();

// @desc    Create a new question
// @route   PUT /api/questions/addquestion
// @access  Public (users, admin)
router.post("/addquestion", fetchuser,isAdmin,
  [
    check('question_text').notEmpty().withMessage('Question text is required'),
    check('options').isArray({ min: 4, max: 4 }).withMessage('Exactly 4 options are required'),
    check('correct_option').notEmpty().withMessage('Correct option is required'),
    check('tags').notEmpty().withMessage('Tags are required'),
    check('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  ], async (req, res) => {
  try {

    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

  const { question_text, options, correct_option, tags, difficulty } = req.body;

  // if (
  //   !question_text ||
  //   !Array.isArray(options) ||
  //   options.length !== 4 ||
  //   !correct_option ||
  //   !tags ||
  //   !difficulty
  // ) {
  //   return res.status(400).json({
  //     message:
  //       "Invalid data. Ensure question text, exactly 4 options, tags is required, and a correct option are provided.",
  //   });
  // }

  // Ensure that req.user._id exists (though fetchuser middleware should handle this)
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: "User not authenticated." });
  }

  // Determine the status based on the user role (admin or regular user)
  const questionStatus = req.user.isAdmin ? "verified" : "pending";

  const question = new Question({
    question_text,
    options,
    correct_option,
    tags,
    difficulty,
    createdBy: req.user.id,
    status: questionStatus, // Set status based on role
  });

  // Save the question to the database
  await question.save();

  // Send a success response
  res.status(201).json({
    message: "Question added successfully",
    question,
    note: req.user.isAdmin
      ? "Question is approved and visible to all users."
      : "Question is pending approval from an admin.",
  });
} catch (error) {
  console.error(error);
    res.status(500).json({ message: "Server error. Could not add the question." });
  }
});

// @desc    Fetch all pending questions (admin only) or reject it
// @route   PUT /api/questions/pendingquestions
// @access  Private (admin only)
router.get("/pendingquestions", fetchuser, isAdmin, async (req, res) => {
  let { page = 1, limit = 10, search = "" } = req.query;

  // Ensure page and limit are integers and positive
  page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
  limit = parseInt(limit, 10) > 0 && parseInt(limit, 10) <= 100 ? parseInt(limit, 10) : 10; // Set a max limit of 100
  search = search.trim(); // Sanitize search input by trimming spaces

  try {
    // Build the search query; apply regex if search is not empty
    const query = {
      status: "pending",
      ...(search && { question_text: { $regex: search, $options: "i" } }), // Apply search only if non-empty
    };

    // Get total count before applying pagination
    const total = await Question.countDocuments(query);

    // Check if the requested page is within bounds
    const totalPages = Math.ceil(total / limit);
    if (page > totalPages) {
      return res.status(400).json({
        message: `Requested page exceeds available pages. There are only ${totalPages} pages.`,
      });
    }

    // Fetch pending questions with pagination and sorting by creation date
    const pendingQuestions = await Question.find(query)
      .populate("createdBy", "name email") // Populate the createdBy field with user details
      .skip((page - 1) * limit) // Skip records for previous pages
      .limit(limit) // Limit the results to 'limit' per page
      .sort({ createdAt: -1 }) // Sort questions by creation date in descending order
      .lean() // Use lean for performance improvement if no document manipulation is needed
      .exec();

    // Send response with pagination data
    res.status(200).json({
      total,
      page,
      totalPages,
      questions: pendingQuestions,
    });
  } catch (error) {
    console.error("Error fetching pending questions:", error);
    res.status(500).json({
      message: "Internal Server Error. Could not fetch pending questions. Please try again later.",
    });
  }
});

// @desc    Update question status
// @route   PUT /api/questions/:id/status
// @access  Private (admin only)
router.put("/:id/status", fetchuser, isAdmin, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // Validate status field
  if (!["verified", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Invalid status. Use 'verified' or 'rejected'." });
  }

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid question ID." });
  }

  try {
    // Find question by ID and update its status
    const question = await Question.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    res.json({
      message: `Question status updated to '${status}'`,
      question,
    });
  } catch (error) {
    console.error("Error updating question status:", error);
    res.status(500).json({
      message: "Internal Server Error. Could not update question status.",
    });
  }
});

// @desc    Fetch all questions with optional pagination and search functionality.
// @route   GET /api/questions/getallquestions
// @access  Public (users, admin)
router.get("/getallquestions", fetchuser, async (req, res) => {
  let { keyword, page = 1, limit = 10 } = req.query;

  // Ensure page and limit are integers and positive
  page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
  limit = parseInt(limit, 10) > 0 && parseInt(limit, 10) <= 100 ? parseInt(limit, 10) : 10; // Set a max limit of 100
  keyword = keyword ? keyword.trim() : ""; // Sanitize keyword input by trimming spaces

  // Initialize query object
  let query = {};

  // Check for keyword to filter questions based on text
  if (keyword) {
    query.question_text = { $regex: keyword, $options: "i" }; // Case-insensitive search
  }

  // Determine if the user is an admin
  if (req.user && req.user.isAdmin) {
    // Admins can see all questions (pending, verified, rejected)
    // No need to reset query, it's already empty
  } else {
    // Regular users can only see verified questions
    query.status = "verified";
  }

  try {
    // Count total documents that match the query
    const count = await Question.countDocuments(query);

    // Fetch questions with pagination, sorted by createdAt
    const questions = await Question.find(query)
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(limit)
      .skip(limit * (page - 1)) // Pagination logic
      .lean(); // Use lean for performance improvement if no document manipulation is needed

    // Send response
    res.status(200).json({
      questions,
      page,
      pages: Math.ceil(count / limit),
      totalQuestions: count,
      message: questions.length === 0 ? "No questions found." : null, // Inform if no questions were found
    });
  } catch (error) {
    console.error("Error fetching questions:", error); // Consider adding more context to the error log
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Update an existing question
// @route   PUT /api/questions/:id/Update
// @access  Private (admin only)
router.put("/:id/Update", fetchuser, isAdmin, async (req, res) => {
  const { question_text, options, correct_option, tags, difficulty } = req.body;

  // Validate request data
  if (
    !question_text ||
    !Array.isArray(options) ||
    options.length !== 4 ||
    !correct_option ||
    !tags ||
    !Array.isArray(tags) || // Ensure tags is an array
    !difficulty
  ) {
    return res.status(400).json({
      message: "Invalid data. Ensure question text, exactly 4 options, tags is required, and a correct option are provided.",
    });
  }

  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update question fields
    question.question_text = question_text;
    question.options = options;
    question.correct_option = correct_option;
    question.tags = tags;
    question.difficulty = difficulty;
    question.updated_at = Date.now(); // Update the timestamp

    await question.save(); // Save changes
    res.status(200).json({ message: "Question updated successfully", question });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (admin only)
router.delete("/:id", fetchuser, isAdmin, async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid question ID." });
    }

    // Find the question by ID
    const question = await Question.findById(req.params.id);

    // If question not found, return 404
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete the question
    await question.deleteOne();

    res.status(200).json({ message: `Question with ID ${req.params.id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
