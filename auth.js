/* auth.js file implements login.  Here we generate a token, call the passport authentication
function with the local strategy, handle errors and login the user */

const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
passport = require('passport');

require('./passport'); // local passport.js file


let generateJWTToken = user => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username encoded in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}


/* login (POST) */
//corresponds to route 13 in documentation.html
module.exports = router => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      //api requires credentials with each request so set session to false to disable session support
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        //if no error send user JSON object and generated token
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
