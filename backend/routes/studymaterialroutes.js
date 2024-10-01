const { check, validationResult } = require('express-validator');
const express = require("express");
const mongoose = require("mongoose");
const StudyMaterial = require('../models/StudyMaterial'); // Path to your StudyMaterial schema
const { fetchuser, isAdmin } = require("../Middleware/authMiddleware");

const router = express.Router();

// Validation middleware for Study Material creation and update
const validateStudyMaterial = [
    check('title', 'Title is required').notEmpty(),
    check('subject', 'Subject is required').notEmpty(),
    check('level', 'Level is required').notEmpty().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level.'),
    check('exam', 'Exam field should be a valid option').optional(),
    // Custom validation to check if either pdfUrl or textContent is provided
    check('pdfUrl').custom((value, { req }) => {
      if (!value && !req.body.textContent) {
        throw new Error('Either PDF URL or Text Content is required.');
      }
      if (value && !/^(ftp|http|https):\/\/[^ "]+$/.test(value)) {
        throw new Error('Must be a valid URL');
      }
      return true;
    })
  ];
  

// @desc    Create new Study Material
// @route   POST /api/studymaterials/create
// @access  Private (Admin only)
router.post('/creatematerial', fetchuser, isAdmin, validateStudyMaterial, async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, subject, level, exam, textContent, pdfUrl, isInteractivePdf } = req.body;

      const newMaterial = new StudyMaterial({
        title,
        description,
        subject,
        level,
        exam,
        textContent,
        pdfUrl,
        isInteractivePdf,
        createdBy: req.user.id // Set the creator's ID (admin) from the token
      });

      await newMaterial.save();
      res.status(201).json({ message: 'Study material created successfully', newMaterial });
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
);

// @desc    Get all Study Materials (Public Access)
// @route   GET /api/studymaterials
// @access  Public
router.get('/getallmaterial', async (req, res) => {
  try {
    const studyMaterials = await StudyMaterial.find(); // Fetch all study materials
    res.status(200).json({ success: true, data: studyMaterials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get a single Study Material by ID
// @route   GET /api/studymaterials/:id
// @access  Public
router.get('/:id/single', async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.findById(req.params.id);
    
    if (!studyMaterial) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    res.status(200).json({ success: true, data: studyMaterial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a Study Material by ID
// @route   PUT /api/studymaterials/updateStudyMaterial/:id
// @access  Private (Admin only)
router.put('/:id/Update', fetchuser, isAdmin, validateStudyMaterial, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, subject, level, exam, textContent, pdfUrl, isInteractivePdf } = req.body;

    const studyMaterial = await StudyMaterial.findById(req.params.id);

    if (!studyMaterial) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    // Update the study material fields
    studyMaterial.title = title || studyMaterial.title;
    studyMaterial.description = description || studyMaterial.description;
    studyMaterial.subject = subject || studyMaterial.subject;
    studyMaterial.level = level || studyMaterial.level;
    studyMaterial.exam = exam || studyMaterial.exam;
    studyMaterial.textContent = textContent || studyMaterial.textContent;
    studyMaterial.pdfUrl = pdfUrl || studyMaterial.pdfUrl;
    studyMaterial.isInteractivePdf = isInteractivePdf !== undefined ? isInteractivePdf : studyMaterial.isInteractivePdf;

    // Save the updated study material
    await studyMaterial.save();
    res.status(200).json({ success: true, message: 'Study material updated successfully', data: studyMaterial });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete a Study Material by ID
// @route   DELETE /api/studymaterials/deleteStudyMaterial/:id
// @access  Private (Admin only)
router.delete('/:id/Delete', fetchuser, isAdmin, async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.findById(req.params.id);

    if (!studyMaterial) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    await studyMaterial.deleteOne(); // Delete study material
    res.status(200).json({ success: true, message: 'Study material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 
