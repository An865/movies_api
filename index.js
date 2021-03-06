/* Dependencies */
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
// Integration on Mongoose ORM
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
//allow mongoose to connect to db
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//bodyparser to parse json in req and res
app.use(bodyParser.json());
//logging with morgan
app.use(morgan('common'));
const passport = require('passport');
require('./passport');
//include cors and define allowed sites
const cors = require('cors');
app.use(cors()); //currently whitelist all origins
//import auth.js and passport
let auth = require('./auth')(app);
// include express validator
const { check, validationResult } = require('express-validator');

/* GET requests */

/**
 * 1. Get homepage endpoint welcome message
 * @method GET
 * @param {string} endpoint - Endpoint to homepage with welcome message. Endpoint: "url/"
 * @returns {string} - Returns welcome message
 */
app.get('/', (req, res)=>{
    res.send('Welcome to myFlix');
})

/**
 * 2. Get all movies or return error
 * @method GET
 * @param {string} endpoint - Endpoint to get all movies. Endpoint: "url/movies"
 * @returns {object} - Returns the movies as an objects
 */

app.get('/movies', passport.authenticate('jwt', {session: false}),(req, res) => {
    Movies.find()
    .then(movies => {
        res.status(201).json(movies);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

/**
 *  3. Get all users or return error
 * @method GET
 * @param {string} endpoint - Endpoint to get all users. Endpoint: "url/users"
 * @returns {object} - Returns the users as an objects
 */
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.find()
    .then(users => {
        res.status(201).json(users);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    })
});

/**
 * 4. Get movie by name 
 * @method GET
 * @param {string} endpoint - Endpoint to get single movie by name.  Endpoint: "url/movies/:name"
 * @param {string} Title - movie title required
 * @returns {object} - Returns movie as an object
 */
app.get('/movies/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({Title: req.params.name})
        .then(movie => {
            res.json(movie);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error ' + error);
        })
});

/**
 * 5. Get user by name 
 * @method GET
 * @param {string} endpoint - Endpoint to get single user by name.  Endpoint: "url/users/:name"
 * @param {string} Title - user's name required
 * @returns {object} - Returns user as an object
 */
app.get('/users/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOne({Username: req.params.name})
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error ' + error);
        })
});

/**
 * 6. Get movie's genre
 * @method GET
 * @param {string} endpoint - Endpoint to get genre details.  Endpoint: "url/movies/:name/genre"
 * @param {string} name -  movie name required
 * @returns {string} - Returns genre of particular movie
 */
app.get('/movies/:name/genre', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({Title: req.params.name})
    .then(movie => {
        res.send(movie.Genre.Name);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error ' + error);
    })
})

/**
* 7. Get movie's director
* @method GET
* @param {string} endpoint - Endpoint to get director details.  Endpoint: "url/movies/:name/director"
* @param {string} name - movie name required "url/movies/action"
* @returns {object} - Returns director of particular movie
*/
app.get('/movies/:name/director', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({Title: req.params.name})
    .then(movie => {
        res.send(movie.Director.Name);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error ' + error);
    })
})

/* POST Requests*/

/**
 * 8. Create new user unless that user already exists. Endpoint: url/users
 * @method POST
 * @param {string} endpoint - endpoint for creating a new user
 * @param {string} - Username, Password, Email, Birthday - required for new user creation
 * @returns {object} - New user as object
 */
app.post('/users', 
//input validation for request body data
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],
(req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({Username: req.body.Username}) //search to see user with req username already exists
    .then(user => {
        if(user){
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
                .create({ //create instance of model (i.e. document)
                    Username: req.body.Username,
                    Password: hashedPassword, //set password to hashed password
                    Email: req.body.Email,
                    Birth: req.body.Birth
                })
                .then(user => {
                    res.status(201).json(user)
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                });
        }     
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});


/* PUT Requests*/

/**
 * 9. Modify user's list of favorite movies
 * @method PUT
 * @param {string} endpoint - Endpoint to modify user's favorite movies list. Endpoint: url/users/:name/movies/MovieID
 * @param {string} Username - username required
 * @param {string} Movie - movie name required
 * @returns {object} - Returns updated user including movie list as object
 */
app.put('/users/:name/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.name }, {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }, //ensures updated document returned
     (err, updatedUser) => {
       if (err) {
         console.error(err);
         res.status(500).send('Error: ' + err);
       } else {
         res.json(updatedUser);
       }
     });
});

/**
 * // 10. Update user's details
 * @method PUT
 * @param {string} endpoint - Endpoint to update user. Endpoint: /users/:username/
 * @param {string} Username - username optional
 * @param {string} Password - password optional
 * @param {string} Email - email optional
 * @returns {object} - Returns updated user as object
 */
app.put('/users/:username/',
//validate any changed data
[
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],
passport.authenticate('jwt', {session: false}), (req, res) => {

 //Check validation object for errors
 let errors = validationResult(req);
 if (!errors.isEmpty()) {
     return res.status(422).json({ errors: errors.array() });
 }

 
 //destructure fields from request body
 const { Username, Password, Email, Birth } = req.body;

 //if username, password, email, or birthdate are included change those fields in db
    if(Username || Password || Email || Birth){

        //password needs to be hashed before changed
        if(Password){
            req.body.Password = Users.hashPassword(Password)
        }

        Users.findOneAndUpdate(
            {Username: req.params.username},
            { $set:
                {
                    //spread operator to pass all fields into database
                    ...req.body 
                }
            },
            {new: true}, //ensures updated document returned
            (error, updatedUser) => {
                if(error) {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                } else {
                    res.json(updatedUser);
                }
            }
         )} else {
             res.status(200).send('No User Information to Update')
         }
});


/* DELETE requests */

/**
 * 11. Delete movie from user's favorite list
 * @method DELETE
 * @param {string} endpoint - Endpoint to delete user account.  Endpoint: url/users/:name/:MovieID
 * @param {string} Username - Username required
 * @returns {object} - Returns updated user object including updated movie list
 */
app.delete('/users/:name/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate(
        {Username: req.params.name},
        {$pull: {FavoriteMovies: req.params.MovieID}},
        {new: true}
    )
    .then(user => {
        user.FavoriteMovies.pull(req.params.MovieID)
        res.status(200).send(user);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

/**
 * 12. Delete user account
 * @method DELETE
 * @param {string} endpoint - Endpoint to delete user account. Endpoint: url/users/:name
 * @param {string} Username - Username required
 * @returns {string} - Returns status
 */
app.delete('/users/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({Username: req.params.name})
        .then(user => {
            if(!user){
                res.status(400).send(req.params.name + ' was not found');
            } else {
                res.status(200).send(req.params.name + ' was deleted');
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        })
})


app.use(express.static('public'));

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('something went wrong');
});

//start server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});