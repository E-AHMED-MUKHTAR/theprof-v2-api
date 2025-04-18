const { constants } = require('../constants');
const errorHand = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            res.json({
                title: "VALIDATION ERROR",
                message: err.message,
                stackTrack: err.stack
            })
        case constants.UNAUTHORIZED:
            res.json({
                title: "UNAUTHORIZED",
                message: err.message,
                stackTrack: err.stack
            })
        case constants.NOT_FOUND:
            res.json({
                title: "NOT FOUND",
                message: err.message,
                stackTrack: err.stack
            })
        case constants.FORBIDEN:
            res.json({
                title: "FORBIDEN",
                message: err.message,
                stackTrack: err.stack
            })
        case constants.SERVER_ERROR:
            res.json({
                title: "SERVER ERROR",
                message: err.message,
                stackTrack: err.stack
            })
        default:
            console.log("ALL IS RIGHT GOOD WORK AHMED");
            break;
    }
};
module.exports = errorHand; 