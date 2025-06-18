const express = require('express')
const router = express.Router()
const admin = require("../controllers/admin")
router
    .post(
        "/Create/New/Teacher",
        admin.add
    )
    router
        .post(
            "/signOut/exist/session/admin",
            admin.signOut
        )
module.exports = router