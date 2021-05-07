

module.exports = {
    ensureAuth: function (req, res, next) {
        if (req.session.user) {
            next();
          } else {
            res.redirect("/login");
          }
  }, ensureAdmin: function (req, res, next) {
    
    if (req.session.user.type === "Admin") {
      next();
    } else {
      //res.send('love')
      res.redirect(req.get("referer"));
    }
  }

  
};

