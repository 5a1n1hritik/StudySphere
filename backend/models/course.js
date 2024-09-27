const mongoose = require("mongoose");

// Course Schema
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model for instructors
      required: true,
    },
    lessons: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
    },
    // curriculum: [
    //   {
    //     module: {
    //       type: String,
    //       required: true,
    //     },
    //     description: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],
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
      default: 0, // Free by default, could be changed
    },
    duration: {
      type: String, // e.g., '10 hours', '6 weeks', etc.
    },
    prerequisites: {
      type: [String], // Array of strings to hold any prerequisites for the course
    },
    image: {
      type: String, // URL to the course image
    },
    featured: {
      type: Boolean,
      default: false, // Default is not featured
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
    toJSON: { virtuals: true }, // Include virtual fields in JSON output
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
  const course = await this.findById(courseId);
  if (!course.enrolledUsers.includes(userId)) {
    course.enrolledUsers.push(userId);
    await course.save();
  } else {
    throw new Error("User already enrolled in this course");
  }
  return course;
};

// Static method to add a rating
courseSchema.statics.addRating = async function (
  courseId,
  userId,
  ratingValue
) {
  const course = await this.findById(courseId);
  const existingRating = course.ratings.find(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingRating) {
    // Update existing rating
    existingRating.rating = ratingValue;
  } else {
    // Add a new rating
    course.ratings.push({ user: userId, rating: ratingValue });
  }

  await course.save();
  return course;
};

// Model creation
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
