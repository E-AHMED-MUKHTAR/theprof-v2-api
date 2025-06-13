
const asyncHand = require('express-async-handler');
const userData = require("../models/users");
const adminData = require('../models/teachers');
const signIn = asyncHand(async (req, res) => {
  const { studentCode, deviceID } = req.body;
  if (!studentCode) {
    return res.status(400).json({ message: "كود مستخدم غير صالح" });
  }
  try {
    const findUser = await userData.findOne({ studentCode });
    if (!findUser) {
      return res.status(404).json({ message: "طالب غير موجود" });
    }
    if (!deviceID) {
      return res.status(400).json({ message: "خطأ في الهاتف المستخدم" });
    }
    else if (findUser.deviceID && findUser.deviceID !== deviceID) {
      return res.status(403).json({ message: "تم استخدام هاتف مختلف برجاء التسجيل بهاتفك" });
    }
    findUser.deviceID = deviceID;
    await findUser.save();
    req.session.deviceID = deviceID;
    req.session.studentCode = studentCode;
    const checkedTeacher = await adminData.findOne({ teacherID: findUser.assignedTeacher });
    if (!checkedTeacher) {
      return res.status(403).json({ message: "مدرس غير موجود" });
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
      return res.status(500).json({ message: "خطأ في النظام", error: "تعارض في الحصص" });
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
      message: "تسجيل دخول ناجح",
      data: {
        ...findUser.toObject(),
        teacher: filteredMonths,
        classes: boughtClasses,
        slider: filteredSlider,
        notifications: filteredNotifications
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "خطأ في الداتا بيز برجاء اخبار المطوريين ", error: error.message });
  }
});
const getMonth = async (req, res) => {
  const { deviceID, studentCode, studentGrade, id } = req.body;
  if (!deviceID || !studentCode || !studentGrade || !id) {
    return res.status(400).json({ message: "برجاء ادخال جميع الحقول" });
  }
  try {
    const student = await userData.findOne({ studentCode });
    if (!student) {
      return res.status(404).json({ message: "طالب غير موجود" });
    }
    if (student.deviceID !== deviceID) {
      return res.status(403).json({
        message: "تم تسجيل دخول بهاتف مختلف ",
      });
    }
    if (req.session.studentCode !== studentCode || req.session.deviceID !== deviceID) {
      return res.status(403).json({ message: "انتهت فتره التسجيل برجاء تسجيل دخول مره اخرى" });
    }
    if (Number(student.studentGrade) !== Number(studentGrade)) {
      return res.status(409).json({
        message: "خطأ في ",
      });
    }
    const teacher = await adminData.findOne({ teacherID: student.assignedTeacher });
    if (!teacher) {
      return res.status(403).json({ message: "مدرس غير موجود" });
    }
    const availableMonth = (Array.isArray(teacher.availableMonths) ? teacher.availableMonths : []).find(
      (month) => Number(month.id) === Number(id) && Number(month.grade) === Number(studentGrade)
    );
    if (!availableMonth) {
      return res.status(404).json({ message: "شهر غير موجود لهذا المستوى" });
    }
    const monthCode = `.${id}.`;
    if (student.boughtMonths.includes(monthCode)) {
      return res.status(409).json({ message: "انت بالفعل مشترى هذا الشهر" });
    }
    const studentCash = Number(student.studentCash);
    const monthPrice = Number(availableMonth.money);
    if (studentCash < monthPrice) {
      return res.status(403).json({
        message: "لا يوجد رصيد كافي للشراء بالرجاء تجديد الرصيد بأبلاغ المدرس",
      });
    }
    student.studentCash = String(studentCash - monthPrice);
    student.boughtMonths += monthCode;
    await student.save();
    return res.status(409).json({
      message: "تم شراء الشهر بنجاح",
      studentCash: student.studentCash,
      boughtMonths: student.boughtMonths,
    });
  } catch (error) {
    return res.status(500).json({ message: "مشكله داخليه بالنظام", error: error.message });
  }
};


module.exports = { signIn, getMonth };
