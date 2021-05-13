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

// 1. Get homepage endpoint welcome message
app.get('/', (req, res)=>{
    res.send('Welcome to myFlix');
})

// 2. Get all movies or return error
app.get('/movies', (req, res) => {
    Movies.find()
    .then(movies => {
        res.status(201).json(movies);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

// 3. Get all users or return error
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

// 4. Get movie by name
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

// 5. Get user by name
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

// 6. Get movie's genre
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

// 7. Get movie's director
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

// 8. Create new user unless that user already exists
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
                    Birthday: req.body.Birthday,
                    FavoriteMovies: []
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


/* 9. PUT Requests*/

// Update/add new favorite movie in user's list
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

// 10. Update user's name
app.put('/users/update/:oldName/:newName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.oldName},
        { $set:
            {
                Username: req.params.newName,
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
    });
});


/* DELETE requests */

// 11. Delete favorite movie from user's list
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

// 12. Delete user's account
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