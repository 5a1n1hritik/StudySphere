const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  video_url: {
    type: String
  },
  duration: {
    type: Number
  },
  resources: [{
    title: {
      type: String,
      required: true
    },
    resource_url: {
      type: String,
      required: true
    }
  }],
  content: {
    type: String
  },
//   quiz: {
//     questions: [{
//       question: {
//         type: String,
//         required: true
//       },
//       options: {
//         type: [String],
//         required: true
//       },
//       correct_answer: {
//         type: String,
//         required: true
//       }
//     }],
//     pass_mark: {
//       type: Number,
//       required: true
//     }
//   },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', // Assuming you have a separate 'Course' model
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);