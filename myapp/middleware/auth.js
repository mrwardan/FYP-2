const { stringify } = require('querystring');
const fetch = require('node-fetch');


module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/login");
    }
  },
  ensureAdmin: function (req, res, next) {
    console.log("Auth: User Type: ", req.session.user.type);
    if (req.session.user.type == "Admin") {
      next();
    } else {
      res.redirect("/login");
    }
  },
  ensureChair: function (req, res, next) {
    console.log("Auth: User Type: ", req.session.user.type);
    if (req.session.user.type == "Chairperson") {
      next();
    } else {
      res.redirect("/login");
    }
  },
  ensureExaminer: function (req, res, next) {
    console.log("Auth: User Type: ", req.session.user.type);
    if (req.session.user.type == "Examiner") {
      next();
    } else {
      res.redirect("/login");
    }
  },
  ensureSupervisor: function (req, res, next) {
    console.log("Auth: User Type: ", req.session.user.type);
    if (req.session.user.type == "Supervisor") {
      next();
    } else {
      res.redirect("/login");
    }
  },
  ensureStudent: function (req, res, next) {
    console.log("Auth: User Type: ", req.session.user.type);
    if (req.session.user.type == "Student") {
      next();
    } else {
      res.redirect("/login");
    }
  },
  ensureCAPCHA:  async (req, res, next) => {
    console.log(
      req.body
    );
    if (!req.body.captcha)
    return res.json({ success: false, msg: 'Please select captcha' });

  // Secret key
  const secretKey = '6Lfo1EobAAAAAMFe6l1-0iec3lZPZEnTWzmwMb9p';

  // Verify URL
  const query = stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.socket.remoteAddress
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL).then(res => res.json());

  // If not successful
  if (body.success !== undefined && !body.success)
    return res.json({ success: false, msg: 'Failed captcha verification' });

  // If successful
  next();

    
    
  },

};


