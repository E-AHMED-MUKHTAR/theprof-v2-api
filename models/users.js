const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    deviceID: {
        type: String,
        require: true
    },
    studentCode: {
        type: String,
        require: true
    },
    studentName: {
        type: String,
        require: true
    },
    studentNumber: {
        type: String,
        require: true
    },
    studentGrade: {
        type: String,
        require: true
    },
    studentCash: {
        type: String,
        require: true
    },
    boughtMonths: {
        type: String,
        require: true
    },
    assignedTeacher: {
        type: String,
        require: true
    },
    activateDate: {
        type: String,
        require: true
    },
    expireDate: {
        type: String,
        require: true
    },
    codeStatus: {
        type: String,
        require: true
    },
    isCenter: {
        type: String,
        require: true
    },
    watchedClasses: {
        type: Array,
        require: true
    },
}, { timestamps: true });
module.exports = mongoose.model("profstudent", UserSchema)

