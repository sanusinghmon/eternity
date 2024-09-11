const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.length >= 2;
            },
            message: 'There must be at least two options.'
        }
    },
    correctAnswer: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) {
                return v >= 0 && v < this.options.length;
            },
            message: 'Correct answer must be an index of one of the options.'
        }
    }
});

const paperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'A paper must have at least one question.'
        }
    },
    couponCodes: {
        type: [String],
        required: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Paper', paperSchema);
