const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        required: true,
        enum: ['superadmin', 'admin', 'manager', 'branch', 'user', 'webeditor'],
        default: 'user'
    },
    phone: {
        type: String,
        match: [/^\d{10}$/, 'Please enter a valid phone number']
    },
    address: {
        type: String,
        maxlength: 255
    },
    picture: {
        type: String,
        match: [/^https?:\/\/.*\.(jpg|jpeg|png|gif|bmp)$/, 'Please enter a valid image URL']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { _id: this._id, username: this.username, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};

module.exports = mongoose.model('User', userSchema);
