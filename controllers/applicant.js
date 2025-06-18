
const asyncHand = require('express-async-handler');
const userData = require("../models/users");
const adminData = require('../models/teachers');
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const { encrypt, decrypt } = require('../utilities/cryptoUtil');

const moment = require('moment');
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
    else if (!deviceID) {
      return res.status(400).json({ message: "حطأ بالهاتف المستخدم" });
    }
    else if (findUser.deviceID && findUser.deviceID !== deviceID) {
      return res.status(403).json({ message: "تم تسجيل الدخول بهاتف مختلف" });
    }
    else if (findUser.admissionStatus) {
      if (findUser.admissionStatus === "Waiting") {
        return res.status(200).json({ message: "في انتظار موافقه المدرس" });
      }
    }
    else if (findUser.expireDate) {
      const expireDate = dayjs(findUser.expireDate, "DD/MM/YYYY - hh:mm:ss A");
      const now = dayjs();
      if (expireDate.isBefore(now)) {
        if (findUser.codeStatus !== "Expired") {
          findUser.codeStatus = "Expired";
          await findUser.save();
        }
        return res.status(400).json({ message: "الرجاء تجديد الاشتراك" });
      } else {
        if (findUser.codeStatus !== "Active") {
          findUser.codeStatus = "Active";
          await findUser.save();
        }
      }
    }
    else {
      res.status(500).json({
        message: "خطأ غير معروف برجاء ابلاغ المطوريين"
      })
    }
    findUser.deviceID = deviceID;
    await findUser.save();
    req.session.deviceID = deviceID;
    req.session.studentCode = studentCode;
    const checkedTeacher = await adminData.findOne({ teacherID: findUser.assignedTeacher });
    if (!checkedTeacher) {
      return res.status(403).json({ message: "المدرس المسجل غير موجود" });
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
      return res.status(500).json({ message: "حطأ داخلي في النظام", error: "تداخل في الحصص" });
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
      message: "تم تسجيل الدخول بنجاح",
      data: {
        ...findUser.toObject(),
        studentNumber: decrypt({ content: findUser.studentNumber }),
        teacher: filteredMonths,
        slider: filteredSlider,
        notifications: filteredNotifications,
        availableClasses: boughtClasses?.map(cls => ({
          ...(cls._doc ? cls._doc : cls),
          title: decrypt({ content: cls.title }),
          description: decrypt({ content: cls.description }),
          img: decrypt({ content: cls.img }),
          url: decrypt({ content: cls.url }),
        })) || [],
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "مشكله في الداتا بيز اخبر مطورين الموقع", error: error.message });
  }
});
const getMonth = asyncHand(async (req, res) => {
  const { deviceID, studentCode, studentGrade, id } = req.body;
  if (!deviceID || !studentCode || !studentGrade || !id) {
    return res.status(400).json({ message: "ادخل جميع الحقول من فضلك " });
  }
  try {
    const student = await userData.findOne({ studentCode });
    if (!student) {
      return res.status(404).json({ message: "لا يوجد طالب بهذا الكود" });
    }
    if (student.deviceID !== deviceID) {
      return res.status(403).json({
        message: "انت مسجل دخول بهاتف اخر لايمكن اجراء عمليه شراء بهاتف مختلف ",
      });
    }
    if (req.session.studentCode !== studentCode || req.session.deviceID !== deviceID) {
      return res.status(403).json({ message: "برجاء تسجيل دخول مره اخرى فتره التسجيل انتهت" });
    }
    if (Number(student.studentGrade) !== Number(studentGrade)) {
      return res.status(409).json({
        message: "خطأ في مستواك ",
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
      return res.status(404).json({ message: "هذا الشهر غير متاح لهذا المستوى" });
    }
    const monthCode = `.${id}.`;
    if (student.boughtMonths.includes(monthCode)) {
      return res.status(409).json({ message: "انت بالفعل مشتري هذا الشهر" });
    }
    const studentCash = Number(student.studentCash);
    const monthPrice = Number(availableMonth.money);
    if (studentCash < monthPrice) {
      return res.status(403).json({
        message: "لا يوجد رصيد كافي برجاء شحن رصيد بأخبار المدرس الخاص بك",
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
    return res.status(500).json({ message: "خطأ في النظام برجاء اخبار المطوريين ", error: error.message });
  }
});

const generateUniqueStudentCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
    const existing = await userData.findOne({ studentCode: code });
    if (!existing) exists = false;
  }
  return code;
};

const requestNewAdmission = asyncHand(async (req, res) => {
  const { studentName, studentPhone, teacherCode, studentGrade, deviceID } = req.body;
  if (!studentName || !studentPhone || !teacherCode || !studentGrade) {
    return res.status(400).json({ message: "الرجاء ادخال جميع البيانات" });
  }

  const studentCode = await generateUniqueStudentCode();

  let studentCash = 0;
  const newStudent = new userData({
    deviceID: deviceID,
    studentCode,
    studentName: studentName,
    studentNumber: encrypt(studentPhone).content,
    studentGrade: studentGrade,
    studentCash: studentCash,
    boughtMonths: "",
    assignedTeacher: teacherCode,
    activateDate: "",
    expireDate: "",
    codeStatus: "Expired",
    admissionStatus: "Waiting",

  });
  await newStudent.save();
  return res.status(201).json({
    message: "تم ارسال الطلب للمدرس وفي حاله انتظار الموافقه",
    student: {
      ...newStudent._doc,
      studentNumber: decrypt({ content: newStudent.studentNumber })
    }
  });
});
const signOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
  });
};
module.exports = { requestNewAdmission, signIn, getMonth , signOut };



