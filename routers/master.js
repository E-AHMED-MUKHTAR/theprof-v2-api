const express = require('express');
const router = express.Router();
const master = require("../controllers/master");
const isAuth = require("../middlewares/reqSession"); 

router.post("/login", master.login);


router.post("/Create/NewStudent", isAuth, master.CreateNewStudent);

router.put("/Update/Student", isAuth, master.updateStudent);

router.put("/Update/StudentActivationDate", isAuth, master.UpdateStudentActivationDate);

router.post("/Create/Month", isAuth, master.CreateMonth);

router.post("/Create/Lecture", isAuth, master.CreateLecture);

router.post("/Create/Notification", isAuth, master.CreateNotification);

router.post("/Create/Slider", isAuth, master.CreateSlider);

router.delete("/Delete/Month", isAuth, master.deleteMonth);

router.delete("/Delete/Lecture", isAuth, master.deleteLecture);

router.delete("/Delete/Slider", isAuth, master.deleteSlider);

router.delete("/Delete/Notification", isAuth, master.deleteNotification);

router.get("/see/requested/from/student", isAuth, master.requestedList);

router.post("/accept/requested/from/student", isAuth, master.acceptOneRequest);

module.exports = router;



// const express = require('express')
// const router = express.Router()
// const master = require("../controllers/master")
// router
//     .post("/login",
//         master.login
//     )
// router
//     .post("/Create/NewStudent",
//         master.CreateNewStudent
//     )
// router
//     .put("/Update/Student",
//         master.updateStudent
//     )
// router
//     .put(
//         "/Update/StudentActivationDate",
//         master.UpdateStudentActivationDate
//     )
// router
//     .post(
//         "/Create/Month",
//         master.CreateMonth
//     )
// router
//     .post(
//         "/Create/Lecture",
//         master.CreateLecture
//     )
// router
//     .post(
//         "/Create/Notification",
//         master.CreateNotification
//     )
// router
//     .post(
//         "/Create/Slider",
//         master.CreateSlider
//     )
// router
//     .delete(
//         "/Delete/Month",
//         master.deleteMonth
//     )
// router
//     .delete(
//         "/Delete/Lecture",
//         master.deleteLecture
//     )
// router
//     .delete(
//         "/Delete/Slider",
//         master.deleteSlider
//     )
// router
//     .delete(
//         "/Delete/Notification",
//         master.deleteNotification
//     )
// router
//     .get(
//         "/see/requested/from/student",
//         master.requestedList
//     )
// router
//     .post(
//         "/accept/requested/from/student",
//         master.acceptOneRequest
//     )

// module.exports = router
