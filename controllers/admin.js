const asyncHand = require('express-async-handler');
const adminData = require('../models/teachers');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../utilitie/cryptoUtil');
const generateTeacherID = () => {
  let teacherID = "";
  while (teacherID.length < 4) {
    teacherID += Math.floor(Math.random() * 10).toString();
  }
  return teacherID;
};
const add = asyncHand(async (req, res) => {
  const { teacherNumber, teacherName, teacherPass } = req.body;
  if (!teacherNumber || !teacherName || !teacherPass) {
    return res.status(400).json({ message: "Teacher number , name and password are required" });
  }
  try {
    let teacherID = generateTeacherID();
    let existingTeacher = await adminData.findOne({ teacherID });
    while (existingTeacher) {
      teacherID = generateTeacherID();
      existingTeacher = await adminData.findOne({ teacherID });
    }
    const encryptedPassword = await bcrypt.hash(teacherPass, 10)
    const newTeacher = new adminData({
      teacherNumber: encrypt(teacherNumber).content,
      teacherName,
      teacherID,
      teacherPass: encryptedPassword
    });
    await newTeacher.save();
    return res.status(201).json({
      message: "تمت اضافه المدرس بنجاح ",
      data: newTeacher
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add teacher", error: error.message });
  }
});
module.exports = { add };
