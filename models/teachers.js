const mongoose = require('mongoose');
const availableClassSchema = new mongoose.Schema({
    description: String,
    monthId: Number,
    id: Number,
    img: String,
    exams: String,
    grade: Number,
    title: String,
    pdf: String,
    url: String,
    videoId: String
}, { _id: false });
const availableMonthsSchema = new mongoose.Schema({
    di: String,
    id: Number,
    img: String,
    grade: Number,
    money: Number,
    name: String,
    vi: String,
}, { _id: false });
const teacherSliderSchema = new mongoose.Schema({
    monthId: Number,
    id: Number,
    img: String,
    grade: Number,
    ti: String,
    url: String,
}, { _id: false });
const teacherNotificationsSchema = new mongoose.Schema({
    id: Number,
    date: String,
    msg: String,
    img: String,
    grade: Number,
    ti: String,
    vi: String,
}, { _id: false });
const teacherSchema = new mongoose.Schema({
    isTeacher: { type: Boolean, default: false },
    teacherPass: String,
    teacherName: String,
    teacherNumber: String,
    availableClasses: { type: [availableClassSchema], default: [] },
    availableMonths: { type: [availableMonthsSchema], default: [] },
    teacherSlider: { type: [teacherSliderSchema], default: [] },
    teacherNotifications: { type: [teacherNotificationsSchema], default: [] },
    currentUpdate: { type: Object, default: {} },
    teacherID: { type: String, required: true, unique: true },
    teacherChecksum: String,
    isCenter: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('profteacher', teacherSchema);