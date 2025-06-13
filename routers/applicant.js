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
router
    .post(
        "/Request/New/Acceptance",
        applicant.requestNewAdmission
    )
module.exports = router