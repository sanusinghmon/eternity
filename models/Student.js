const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    lastName: { 
    type: String, 
    required: true 
    },
    middleName: { type: String },
    dateOfBirth: { type: Date, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        minlength: 5,
        maxlength: 100
    },
    school: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    city: { type: String },
    address: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    mobileNumber: { type: String, required: true, unique: true },
    alternateMobileNumber: { type: String, unique: true },
    college: { type: String },
    
    couponCode: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 20
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Method to generate JWT token
studentSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, name: this.name, email: this.email, school: this.school },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Adjust token expiry as needed
    );
    return token;
};

module.exports = mongoose.model('Student', studentSchema);
