

module.exports = {
    ensureAuth: function (req, res, next) {
        if (req.session.user) {
            next();
          } else {
            res.redirect("/login");
          }
  }, ensureAdmin: function (req, res, next) {
    console.log('User Type: ',req.session.user.type);
    if (req.session.user.type == "Admin") {
      next();
    } else {
      //res.send('love')
      res.redirect(req.get("referer"));
    }
  }

  
};

