const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { 
        type: [String], 
        required: true, 
        unique: true 
    },
    paperId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Paper', 
        required: true 
    },
    paperName:{
        type:String,
        required:true,
        unique:true,
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    },
    expiryDate: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'used', 'expired'],
        default: 'active'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Coupon', couponSchema);
