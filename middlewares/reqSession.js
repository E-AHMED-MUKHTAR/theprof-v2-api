
const isAuth = (req, res, next) => {
  if (req.session && req.session.teacherID) {
    return next(); 
  }

  return res.status(401).json({ message: "غير مصرح لك. الرجاء تسجيل الدخول." });
};

module.exports = isAuth;