const express = require('express')
const router = express.Router()
const applicant = require("../controllers/applicant")
router
    .post(
        "/GetTeacherDataByCode",
        applicant.signIn
    )
router
    .post(
        "/BuyMonth",
        applicant.getMonth
    )
module.exports = router