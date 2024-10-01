const mongoose = require("mongoose");

const PerformanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accuracy: { type: Number, default: 0 }, // Overall accuracy
    performanceHistory: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        accuracy: { type: Number, required: true },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
      },
    ],
    struggledTopics: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Performance", PerformanceSchema);
