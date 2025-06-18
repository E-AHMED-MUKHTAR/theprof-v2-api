const express = require('express');
const router = express.Router();
const master = require("../controllers/master");
const isAuth = require("../middlewares/reqSession");

router
    .post(
        "/login",
        master.login
    );


router
    .post(
        "/Create/NewStudent",
        isAuth,
        master.CreateNewStudent
    );

router
    .put(
        "/Update/Student",
        isAuth,
        master.updateStudent
    );

router
    .put(
        "/Update/StudentActivationDate",
        isAuth,
        master.UpdateStudentActivationDate

    );

router
    .post(
        "/Create/Month",
        isAuth,
        master.CreateMonth

    );

router
    .post(
        "/Create/Lecture",
        isAuth,
        master.CreateLecture

    );

router
    .post(
        "/Create/Notification",
        isAuth,
        master.CreateNotification

    );

router
    .post(
        "/Create/Slider",
        isAuth,
        master.CreateSlider

    );

router
    .delete(
        "/Delete/Month",
        isAuth, master.deleteMonth);

router
    .delete(
        "/Delete/Lecture",
        isAuth,
        master.deleteLecture

    );

router
    .delete(
        "/Delete/Slider",
        isAuth,
        master.deleteSlider

    );

router
    .delete(
        "/Delete/Notification",
        isAuth,
        master.deleteNotification

    );

router
    .get(
        "/see/requested/from/student",
        isAuth,
        master.requestedList

    );

router
    .post(
        "/accept/requested/from/student",
        isAuth,
        master.acceptOneRequest
    );

router
    .post(
        "/logout/exist/session/teacher",
        master.logout
    );

module.exports = router;


