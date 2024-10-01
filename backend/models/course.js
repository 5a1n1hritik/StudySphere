const mongoose = require("mongoose");

// Course Schema
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensure title is unique
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10, // Minimum length for description
    },
    category: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    price: {
      type: Number,
      default: 0, // Free by default
      min: 0, // Ensure price is non-negative
    },
    duration: {
      type: String, // e.g., '10 hours', '6 weeks', etc.
      required: true, // Make it required
      validate: {
        validator: function (v) {
          // Basic duration validation
          return /^\d+\s(?:hours|weeks|months)$/.test(v);
        },
        message: (props) => `${props.value} is not a valid duration format!`,
      },
    },
    prerequisites: {
      type: [String], // Array of strings for prerequisites
    },
    image: {
      type: String, // URL to the course image
      validate: {
        validator: function (v) {
          // Basic image URL validation
          return /^(ftp|http|https):\/\/[^ "]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid image URL!`,
      },
    },
    featured: {
      type: Boolean,
      default: false, // Default is not featured
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to calculate average rating
courseSchema.virtual("averageRating").get(function () {
  const totalRatings = this.ratings.length;
  const totalRatingValue = this.ratings.reduce(
    (sum, rating) => sum + rating.rating,
    0
  );
  return totalRatings > 0
    ? (totalRatingValue / totalRatings).toFixed(2)
    : "No ratings yet";
});

// Static method to enroll a user in a course
courseSchema.statics.enrollUser = async function (courseId, userId) {
  try {
    const course = await this.findById(courseId);
    if (!course) throw new Error("Course not found");

    if (!course.enrolledUsers.includes(userId)) {
      course.enrolledUsers.push(userId);
      await course.save();
    } else {
      throw new Error("User already enrolled in this course");
    }
    return course;
  } catch (error) {
    throw new Error(`Failed to enroll user: ${error.message}`);
  }
};

// Static method to add a rating
courseSchema.statics.addRating = async function (
  courseId,
  userId,
  ratingValue
) {
  try {
    const course = await this.findById(courseId);
    if (!course) throw new Error("Course not found");

    const existingRating = course.ratings.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRating) {
      existingRating.rating = ratingValue; // Update existing rating
    } else {
      course.ratings.push({ user: userId, rating: ratingValue }); // Add new rating
    }

    await course.save();
    return course;
  } catch (error) {
    throw new Error(`Failed to add rating: ${error.message}`);
  }
};

// Model creation
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
