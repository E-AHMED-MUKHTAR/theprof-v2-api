const asyncHand = require('express-async-handler');
const userData = require("../models/users");
const adminData = require('../models/teachers');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../utilities/cryptoUtil');
const login = asyncHand(async (req, res) => {
  const { teacherPass, teacherID } = req.body;
  if (!teacherID) {
    return res.status(400).json({ message: "لم يتم توفير الرقم التعريفي" });
  }
  const findUser = await adminData.findOne({ teacherID });
  const user_allowed = await bcrypt.compare(teacherPass, findUser.teacherPass)
  if (!findUser) {
    return res.status(404).json({ message: " المعلم غير موجود" });
  }
  if (!teacherPass) {
    return res.status(400).json({ message: "لم يتم توفير كلمه مرور" });
  } else if (!user_allowed) {
    return res.status(403).json({ message: "كلمة المرور غير صحيحة" });
  }
  else if (user_allowed) {
    req.session.teacherID = teacherID;
    req.session.teacherPass = teacherPass;
    const students = await userData.find({ assignedTeacher: teacherID });
    let activeCount = 0;
    let expiredCount = 0;
    const now = moment();
    for (const student of students) {
      const expire = moment(student.expireDate, "DD/MM/YYYY - hh:mm:ss A");
      if (expire.isAfter(now)) {
        if (student.codeStatus !== 'Active') {
          student.codeStatus = 'Active';
          await student.save();
        }
        activeCount++;
      } else {
        if (student.codeStatus !== 'Expired') {
          student.codeStatus = 'Expired';
          await student.save();
        }
        expiredCount++;
      }
    }
    const decryptedTeacher = {
      ...findUser._doc,
      teacherNumber: decrypt({ content: findUser.teacherNumber }),
      availableClasses: findUser.availableClasses?.map(cls => ({
        ...cls._doc,
        title: decrypt({ content: cls.title }),
        description: decrypt({ content: cls.description }),
        img: decrypt({ content: cls.img }),
        url: decrypt({ content: cls.url }),
      })) || [],
    };
    return res.status(200).json({
      message: "تسجيل دخول ناجح",
      data: {
        teacher: decryptedTeacher,
        totalStudents: students.length,
        activeStudents: activeCount,
        expiredStudents: expiredCount,
        availableClassesCount: findUser.availableClasses?.length || 0,
        availableMonthsCount: findUser.availableMonths?.length || 0,
      }
    });
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
const CreateNewStudent = asyncHand(async (req, res) => {
  const { studentcash, studentgrade, studentname, studentNumber } = req.body;
  if (!studentname || !studentgrade || !studentcash) {
    return res.status(400).json({ message: "الرجاء ادخال جميع البيانات" });
  }
  const teacherID = req.session.teacherID;
  if (!teacherID) {
    return res.status(401).json({ message: " لا يوجد جلسة" });
  }
  if (!studentcash || !studentgrade || !studentname) {
    return res.status(400).json({ message: "نقص في البيانات" });
  }
  const studentCode = await generateUniqueStudentCode();
  const activateDate = moment().format("DD/MM/YYYY - hh:mm:ss A");
  const expireDate = moment().add(1, 'month').format("DD/MM/YYYY - hh:mm:ss A");
  const newStudent = new userData({
    deviceID: "",
    studentCode,
    studentName: studentname,
    studentNumber: encrypt(studentNumber).content,
    studentGrade: studentgrade,
    studentCash: studentcash,
    boughtMonths: "",
    assignedTeacher: teacherID,
    activateDate,
    expireDate,
    codeStatus: "Active",
    isCenter: "false",
    watchedClasses: []
  });
  await newStudent.save();
  return res.status(201).json({
    message: " تم إنشاء الطالب بنجاح",
    student: {
      ...newStudent._doc,
      studentNumber: decrypt({ content: newStudent.studentNumber })
    }

  });
});
const updateStudent = asyncHand(async (req, res) => {
  const {
    studentName,
    studentCode,
    studentNumber,
    studentGrade,
    studentCash
  } = req.body;
  if (!studentName || !studentCode || !studentNumber || !studentGrade || !studentCash) {
    return res.status(400).json({ message: "الرجاء ادخال جميع البيانات" });
  }
  const teacherID = req.session.teacherID;
  if (!teacherID) {
    return res.status(401).json({ message: " لا يوجد جلسة" });
  }
  if (!studentCode) {
    return res.status(400).json({ message: "نقص في البيانات" });
  }
  const student = await userData.findOne({ studentCode });
  if (!student) {
    return res.status(404).json({ message: "الطالب غير موجود" });
  }
  if (student.assignedTeacher !== teacherID) {
    return res.status(403).json({ message: "ليس لك صلاحية تعديل هذا الطالب" });
  }
  if (studentName) student.studentName = studentName;
  if (studentNumber) student.studentNumber = encrypt(studentNumber).content;
  if (studentGrade) student.studentGrade = studentGrade;
  if (studentCash) student.studentCash = studentCash;
  await student.save();
  return res.status(201).json({
    message: "تم إنشاء الطالب بنجاح",
    student: {
      ...student._doc,
      studentNumber: decrypt({ content: student.studentNumber })
    }
  });
});
const UpdateStudentActivationDate = asyncHand(async (req, res) => {
  const {
    studentCode
  } = req.body;
  const teacherID = req.session.teacherID;
  if (!teacherID) {
    return res.status(401).json({ message: " لا يوجد جلسة" });
  }
  if (!studentCode) {
    return res.status(400).json({ message: "نقص في البيانات" });
  }
  const student = await userData.findOne({ studentCode: studentCode });
  if (!student) {
    return res.status(404).json({ message: "الطالب غير موجود" });
  }
  if (student.assignedTeacher !== teacherID) {
    return res.status(403).json({ message: "ليس لك صلاحية تعديل هذا الطالب" });
  }
  const newActivateDate = moment().format("DD/MM/YYYY - hh:mm:ss A");
  const newExpireDate = moment().add(1, 'month').format("DD/MM/YYYY - hh:mm:ss A");
  student.activateDate = newActivateDate;
  student.expireDate = newExpireDate;
  await student.save();
  return res.status(200).json({
    message: " تم تجديد المدة",
    student: {
      ...student._doc,
      studentNumber: decrypt({ content: student.studentNumber })
    }
  });
});
const CreateMonth = asyncHand(async (req, res) => {
  const teacherID = req.session.teacherID;
  const { name, grade, money, di, vi } = req.body;
  if (!grade || !name || !money || !di || !vi) {
    return res.status(400).json({ message: "الرجاء ادخال جميع البيانات" });
  }
  if (!teacherID) {
    return res.status(401).json({ message: " لا يوجد جلسة" });
  }
  const teacher = await adminData.findOne({ teacherID });
  if (!teacher) {
    return res.status(404).json({ message: " المعلم غير موجود" });
  }
  let id = 1;
  if (teacher.availableMonths && teacher.availableMonths.length > 0) {
    const sameGradeMonths = teacher.availableMonths.filter(
      (month) => month.grade === grade
    );
    if (sameGradeMonths.length > 0) {
      const lastId = Math.max(...sameGradeMonths.map((month) => month.id));
      id = lastId + 1;
    }
  }
  const img = `https://raw.githubusercontent.com/the-prof-corporation/the-prof/refs/heads/main/Numbers/${id}.png`;
  const newMonth = {
    id,
    name,
    img,
    grade,
    money,
    di,
    vi
  };
  const updateResult = await adminData.findOneAndUpdate(
    { teacherID },
    {
      $push: { availableMonths: newMonth }
    },
    { new: true, runValidators: true }
  );
  return res.status(201).json({
    message: "تم الإضافة",
    availableMonths: updateResult.availableMonths
  });
});

// error on vercel 

const getYouTubeVideoDetails = require('../utilities/getYouTubeVideoDetails');


const getYouTubeVideoId = (url) => {
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};



const CreateLecture = asyncHand(async (req, res) => {
  const teacherID = req.session?.teacherID;
  const { grade, monthId, exams, pdf, url } = req.body;

  if (!grade || !monthId || !exams || !pdf || !url) {
    return res.status(400).json({ message: "الرجاء إدخال جميع البيانات" });
  }

  if (!teacherID) {
    return res.status(401).json({ message: "لا يوجد جلسة" });
  }

  const videoId = getYouTubeVideoId(url);
  console.log("📹 videoId:", videoId);
  if (!videoId) {
    return res.status(400).json({ message: "رابط يوتيوب غير صالح" });
  }

  const videoDetails = await getYouTubeVideoDetails(videoId);
  if (!videoDetails || !videoDetails.title || !videoDetails.img) {
    return res.status(400).json({ message: "تعذر جلب بيانات الفيديو" });
  }

  const teacher = await adminData.findOne({ teacherID });
  if (!teacher) {
    return res.status(404).json({ message: "المعلم غير موجود" });
  }

  let id = 1;
  if (teacher.availableClasses && teacher.availableClasses.length > 0) {
    const sameGradeLectures = teacher.availableClasses.filter(
      (cls) => cls.grade === grade
    );
    if (sameGradeLectures.length > 0) {
      const lastId = Math.max(...sameGradeLectures.map((cls) => cls.id));
      id = lastId + 1;
    }
  }

  const newLecture = {
    title: encrypt(videoDetails.title)?.content,
    description: encrypt(videoDetails.description)?.content,
    img: encrypt(videoDetails.img)?.content,
    id,
    videoId,
    grade,
    monthId,
    exams,
    pdf,
    url: encrypt(url)?.content,
  };

  const updateResult = await adminData.findOneAndUpdate(
    { teacherID },
    { $push: { availableClasses: newLecture } },
    { new: true, runValidators: true }
  );

  if (!updateResult) {
    return res.status(500).json({ message: "خطأ أثناء حفظ المحاضرة في قاعدة البيانات" });
  }

  const decryptedClasses = updateResult.availableClasses.map(cls => ({
    ...cls._doc,
    title: decrypt({ content: cls.title }),
    description: decrypt({ content: cls.description }),
    img: decrypt({ content: cls.img }),
    url: decrypt({ content: cls.url }),
  }));

  return res.status(201).json({
    message: "تم الإضافة بنجاح",
    availableClasses: decryptedClasses,
  });
});


const CreateNotification = asyncHand(async (req, res) => {
  const teacherID = req.session.teacherID;
  const { msg, img, grade, ti, vi } = req.body;
  if (!grade || !msg || !ti) {
    return res.status(400).json({ message: "نقص في البيانات" });
  }
  if (!teacherID) {
    return res.status(401).json({ message: "لا يوجد جلسة" });
  }
  const date = moment().format("DD/MM/YYYY - hh:mm:ss A");
  const teacher = await adminData.findOne({ teacherID });
  if (!teacher) {
    return res.status(404).json({ message: "المعلم غير موجود" });
  }
  let id = 1;
  if (Array.isArray(teacher.teacherNotifications) && teacher.teacherNotifications.length > 0) {
    const validIds = teacher.teacherNotifications
      .map(n => typeof n.id === 'number' ? n.id : 0);
    const lastId = Math.max(...validIds);
    id = lastId + 1;
  }
  const newNotification = {
    id,
    date,
    msg,
    img,
    grade,
    ti,
    vi
  };
  const updateResult = await adminData.findOneAndUpdate(
    { teacherID },
    {
      $push: {
        teacherNotifications: newNotification
      }
    },
    { new: true, runValidators: true }
  );
  if (!updateResult) {
    return res.status(500).json({ message: "حدث خطأ أثناء الحفظ" });
  }
  return res.status(201).json({
    message: "تمت إضافة الإشعار بنجاح",
    teacherNotifications: updateResult.teacherNotifications
  });
});
const CreateSlider = asyncHand(async (req, res) => {
  const teacherID = req.session.teacherID;
  const {
    id,
    monthId,
    img,
    grade,
    ti,
    url
  } = req.body;
  if (!grade || !id || !monthId || !ti || !url || !img) {
    return res.status(400).json({ message: "نقص في البيانات" });
  }
  if (!teacherID) {
    return res.status(401).json({ message: " لا يوجد جلسة" });
  }
  const updateResult = await adminData.findOneAndUpdate(
    { teacherID },
    {
      $push: { teacherSlider: { id, monthId, img, grade, ti, url } }
    },
    { new: true, runValidators: true }
  );
  if (!updateResult) {
    return res.status(404).json({ message: " المعلم غير موجود" });
  }
  return res.status(201).json({
    message: "تم الإضافة",
    teacherSlider: updateResult.teacherSlider
  });
});
const deleteMonth = asyncHand(async (req, res) => {
  const teacherID = req.session.teacherID;
  const {
    grade,
    id
  } = req.body;
  if (!teacherID) return res.status(401).json({ message: " لا يوجد جلسة" });
  const updateResult = await adminData.findOneAndUpdate(
    { teacherID },
    {
      $pull: {
        availableMonths: { grade, id },
        availableClasses: { grade, id }
      }
    },
    { new: true }
  );
  if (!updateResult) return res.status(404).json({ message: " المعلم غير موجود" });
  return res.status(200).json({
    message: "تم الإضافة",
    availableMonths: updateResult.availableMonths,
    availableClasses: updateResult.availableClasses
  });
});
const deleteLecture = asyncHand(async (req, res) => {
  const teacherID = req.session.teacherID;
  const {
    monthId,
    id
  } = req.body;
  if (!teacherID) return res.status(401).json({ message: " لا يوجد جلسة" });
  if (monthId === undefined || id === undefined)
    return res.status(400).json({ message: "نقص في البيانات" });
  const updateResult = await adminData.findOneAndUpdate(
    { teacherID },
    {
      $pull: {
        availableClasses: { monthId, id }
      }
    },
    { new: true }
  );
  if (!updateResult) return res.status(404).json({ message: " المعلم غير موجود" });
  return res.status(200).json({
    message: "تم حذف العنصر",
    availableClasses: updateResult.availableClasses
  });
});
const deleteSlider = asyncHand(async (req, res) => {
  const teacherID = req.session.teacherID;
  const {
    monthId,
    id
  } = req.body;
  if (!teacherID) return res.status(401).json({ message: " لا يوجد جلسة" });
  if (monthId === undefined || id === undefined)
    return res.status(400).json({ message: "نقص في البيانات" });
  const updateResult = await adminData.findOneAndUpdate(
    { teacherID },
    {
      $pull: { teacherSlider: { monthId, id } }
    },
    { new: true }
  );
  if (!updateResult) return res.status(404).json({ message: " المعلم غير موجود" });
  return res.status(200).json({
    message: "تم حذف العنصر",
    teacherSlider: updateResult.teacherSlider
  });
});
const deleteNotification = asyncHand(async (req, res) => {
  const teacherID = req.session.teacherID;
  const { id, grade } = req.body;
  if (!teacherID) {
    return res.status(401).json({ message: "لا يوجد جلسة" });
  }
  if (typeof id !== 'number' || !grade) {
    return res.status(400).json({ message: "نقص في البيانات: تأكد من إدخال id و grade" });
  }
  const updateResult = await adminData.findOneAndUpdate(
    { teacherID },
    {
      $pull: {
        teacherNotifications: {
          id,
          grade
        }
      }
    },
    { new: true }
  );
  if (!updateResult) {
    return res.status(404).json({ message: "المعلم غير موجود" });
  }
  return res.status(200).json({
    message: "تم حذف الإشعار بنجاح",
    teacherNotifications: updateResult.teacherNotifications
  });
});

const requestedList = asyncHand(async (req, res) => {
  const teacherID = req.session.teacherID;
  if (!teacherID) {
    return res.status(401).json({ message: " لا يوجد جلسة" });
  }
  const student = await userData.find(
    {
      admissionStatus: "Waiting",
      assignedTeacher: teacherID
    });
  return res.status(200).json({
    message: "نتائج البحث",
    requested: student
  });
});

const acceptOneRequest = asyncHand(async (req, res) => {
  const { AcceptedCode } = req.body;

  const teacherID = req.session.teacherID;
  if (!teacherID) {
    return res.status(401).json({ message: " لا يوجد جلسة" });
  }
  const student = await userData.findOne(
    {
      "studentCode": AcceptedCode
    });
  if (!student) {
    return res.status(404).json({ message: "الطالب غير موجود" });
  }
  if (student.assignedTeacher !== teacherID) {
    return res.status(403).json({ message: "ليس لك صلاحية تعديل هذا الطالب" });
  }
  const newActivateDate = moment().format("DD/MM/YYYY - hh:mm:ss A");
  const newExpireDate = moment().add(1, 'month').format("DD/MM/YYYY - hh:mm:ss A");

  const newStatus = "accepted"
  const newCodeStatus = "Active"

  student.admissionStatus = newStatus;
  student.codeStatus = newCodeStatus;
  student.activateDate = newActivateDate;
  student.expireDate = newExpireDate;
  await student.save();
  return res.status(200).json({
    message: "تمت الموافقه",
    requested: student
  });
});

module.exports = {
  login,
  CreateNewStudent,
  updateStudent,
  UpdateStudentActivationDate,
  CreateMonth,
  CreateLecture,
  CreateNotification,
  CreateSlider,
  deleteMonth,
  deleteLecture,
  deleteSlider,
  deleteNotification,
  requestedList,
  acceptOneRequest
}



