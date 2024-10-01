const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    activityType: { type: String, enum: ['Quiz', 'Question Paper'], required: true },
    questions: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        score: { type: Number, default: 0 }  // Track score per question
    }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Completed', 'Pending'], default: 'Pending' },
    totalScore: { type: Number, default: 0 }, // Overall score
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
