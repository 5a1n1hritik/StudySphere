const mongoose = require('mongoose');

// Study Material Schema
const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true,
    enum: ['Math', 'Science', 'General Studies', 'English', 'History', 'Physics', 'Chemistry', 'Economics', 'Computer Science', 'Sociology','Political Science', 'Biology', 'Environmental Science'], // Expand as needed
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  exam: {
    type: String,
    required: true,
    enum: ['Civil Services', 'Banking', 'Engineering', 'State Government', 'Railways', 'Defense'], // Expand as needed
  },
  textContent: {
    type: String, // Store study material in text format
    trim: true,
    default: '' // Allows this to be optional
  },
  pdfUrl: {
    type: String, // Store the link to the PDF file if material is in PDF format
    validate: {
        required: true,
      validator: function (v) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(v); // valid URL
      },
      message: props => `${props.value} is not a valid URL!`,
    },
  },
  isInteractivePdf: {
    type: Boolean,
    default: false, // Indicates if the PDF is interactive
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User model, can be used to track who created the material
    required: true // Ensure only admins can create study material
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Pre-validation hook to ensure at least one of 'textContent' or 'pdfUrl' is provided
// studyMaterialSchema.pre('validate', function (next) {
//   if (!this.textContent && !this.pdfUrl) {
//     next(new Error('Please provide either text content or a valid PDF URL.'));
//   } else {
//     next();
//   }
// });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
