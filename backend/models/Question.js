const mongoose = require("mongoose");

// Option sub-schema
const optionSchema = new mongoose.Schema({
  label: { type: String, enum: ["A", "B", "C", "D"], required: true },
  text: { type: String, required: true },
});

// Main question schema
const questionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  options: [optionSchema], // Array of options
  correct_option: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  tags: [
    {
      type: String,
      enum: [
        "gk",
        "math",
        "english",
        "science",
        "geography",
        "indian states",
        "rajasthan",
        "capitals",
        "general knowledge",
        "trivia",
        "culture",
        "history",
        "capital cities",
        "astronomy",
        "planets",
        "chemistry",
        "literature",
        "plays",
        "sports",
        "soccer",
      ],
      required: true,
    },
  ],

  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }, // Optional, to store the time of the last update
});

// Automatically set updated_at to current date when the document is modified
questionSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Model
const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
