const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Trims any extra whitespace
    },
    videoUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(ftp|http|https):\/\/[^ "]+$/.test(v); // Simple URL validation
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 minute"], // Ensure duration is positive
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        resourceUrl: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              return /^(ftp|http|https):\/\/[^ "]+$/.test(v); // URL validation
            },
            message: (props) => `${props.value} is not a valid URL!`,
          },
        },
      },
    ],
    content: {
      type: String,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Reference to Course model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Lesson", lessonSchema);
