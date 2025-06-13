const express = require('express')
const router = express.Router()
const login = require("../controllers/login")
router
    .post(
        "/GetTeacherDataByCode",
        login.signIn
    )
router
    .post(
        "/BuyMonth",
        login.getMonth
    )
module.exports = router