
const asyncHand = require('express-async-handler');
const userData = require("../models/users");
const adminData = require('../models/teachers');
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const signIn = asyncHand(async (req, res) => {
  const { studentCode, deviceID } = req.body;
  if (!studentCode) {
    return res.status(400).json({ message: "No studentCode provided" });
  }
  try {
    const findUser = await userData.findOne({ studentCode });
    if (!findUser) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (!deviceID) {
      return res.status(400).json({ message: "No device ID provided" });
    }
    else if (findUser.deviceID && findUser.deviceID !== deviceID) {
      return res.status(403).json({ message: "You are logged in on another device!" });
    }
    if (findUser.expireDate) {
      const expireDate = dayjs(findUser.expireDate, "DD/MM/YYYY - hh:mm:ss A");
      const now = dayjs();
      if (expireDate.isBefore(now)) {
        if (findUser.codeStatus !== "Expired") {
          findUser.codeStatus = "Expired";
          await findUser.save();
        }
        return res.status(400).json({ message: "Please renew your subscription." });
      } else {
        if (findUser.codeStatus !== "Active") {
          findUser.codeStatus = "Active";
          await findUser.save();
        }
      }
    }
    findUser.deviceID = deviceID;
    await findUser.save();
    req.session.deviceID = deviceID;
    req.session.studentCode = studentCode;
    const checkedTeacher = await adminData.findOne({ teacherID: findUser.assignedTeacher });
    if (!checkedTeacher) {
      return res.status(403).json({ message: "Assigned teacher not found" });
    }
    const boughtMonths = (findUser.boughtMonths.match(/\d+/g) || []).map(Number);
    let boughtClasses = [];
    if (Array.isArray(checkedTeacher.availableClasses)) {
      boughtClasses = checkedTeacher.availableClasses.filter(cls => {
        const classMonthId = Number(cls.monthId);
        const studentGrade = findUser.studentGrade;
        return classMonthId && boughtMonths.includes(classMonthId) && cls.grade === Number(studentGrade);
      });
    } else {
      return res.status(500).json({ message: "Internal error", error: "Classes data corrupted" });
    }
    const studentGrade = Number(findUser.studentGrade);
    let filteredMonths = [];
    if (Array.isArray(checkedTeacher.availableMonths)) {
      filteredMonths = checkedTeacher.availableMonths.filter(month => {
        return Number(month.grade) === Number(studentGrade);
      });
    }
    let filteredSlider = [];
    if (Array.isArray(checkedTeacher.teacherSlider)) {
      filteredSlider = checkedTeacher.teacherSlider.filter(slide => {
        return Number(slide.grade) === Number(studentGrade);
      });
    }
    let filteredNotifications = [];
    if (Array.isArray(checkedTeacher.teacherNotifications)) {
      filteredNotifications = checkedTeacher.teacherNotifications.filter(note => {
        return Number(note.grade) === Number(studentGrade);
      });
    }
    return res.status(200).json({
      message: "Login successful",
      data: {
        ...findUser.toObject(),
        teacher: filteredMonths,
        classes: boughtClasses,
        slider: filteredSlider,
        notifications: filteredNotifications
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
});
const getMonth = async (req, res) => {
  const { deviceID, studentCode, studentGrade, id } = req.body;
  if (!deviceID || !studentCode || !studentGrade || !id) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const student = await userData.findOne({ studentCode });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.deviceID !== deviceID) {
      return res.status(403).json({
        message: "You are logged in on another device! You can only purchase through your device.",
      });
    }
    if (req.session.studentCode !== studentCode || req.session.deviceID !== deviceID) {
      return res.status(403).json({ message: "Session expired or invalid. Please log in again." });
    }
    if (Number(student.studentGrade) !== Number(studentGrade)) {
      return res.status(409).json({
        message: "There's something wrong with your grade.",
      });
    }
    const teacher = await adminData.findOne({ teacherID: student.assignedTeacher });
    if (!teacher) {
      return res.status(403).json({ message: "Teacher not found" });
    }
    const availableMonth = (Array.isArray(teacher.availableMonths) ? teacher.availableMonths : []).find(
      (month) => Number(month.id) === Number(id) && Number(month.grade) === Number(studentGrade)
    );
    if (!availableMonth) {
      return res.status(404).json({ message: "Month not available for this grade" });
    }
    const monthCode = `.${id}.`;
    if (student.boughtMonths.includes(monthCode)) {
      return res.status(409).json({ message: "You have already purchased this month." });
    }
    const studentCash = Number(student.studentCash);
    const monthPrice = Number(availableMonth.money);
    if (studentCash < monthPrice) {
      return res.status(403).json({
        message: "You do not have enough balance. Please contact your teacher to recharge.",
      });
    }
    student.studentCash = String(studentCash - monthPrice);
    student.boughtMonths += monthCode;
    await student.save();
    return res.status(409).json({
      message: "A new month has been added successfully.",
      studentCash: student.studentCash,
      boughtMonths: student.boughtMonths,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { signIn, getMonth };
