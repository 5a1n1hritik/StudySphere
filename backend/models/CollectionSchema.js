const mongoose = require('mongoose');

const UserCollectionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    favoriteQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    struggledQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
}, { timestamps: true });

module.exports = mongoose.model('UserCollection', UserCollectionSchema);
