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
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
//bodyparser to parse json in req and res
app.use(bodyParser.json());
//logging with morgan
app.use(morgan('common'));


/* GET requests */

// Get homepage endpoint welcome message
app.get('/', (req, res)=>{
    res.send('Welcome to myFlix');
})

// Get all movies or return error
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

// Get all users or return error
app.get('/users', (req, res)=>{
    Users.find()
    .then(users => {
        res.status(201).json(users);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    })
});

// Get movie by name
app.get('/movies/:name', (req, res) => {
    Movies.findOne({Title: req.params.name})
        .then(movie => {
            res.json(movie);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error ' + error);
        })
});

// Get movie's genre
app.get('/movies/:name/genre', (req, res) => {
    Movies.findOne({Title: req.params.name})
    .then(movie => {
        res.send(movie.Genre.Name);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error ' + error);
    })
})

// Get movie's director
app.get('/movies/:name/director', (req, res) => {
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

// Create new user unless that user already exists
app.post('/users', (req, res) => {
    Users.findOne({Username: req.body.Username})
    .then(user => {
        if(user){
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
                .create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then(user => {
                    res.status(201).json(user)
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
        }     
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});


/* PUT Requests*/

// Update/add new favorite movie in user's list
app.put('/users/:name/movies/:MovieID', (req, res) => {
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

// Update user's name
app.put('/users/update/:oldName/:newName', (req, res) => {
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

// Delete movie from user's list of favotires
app.delete('/users/:name/:MovieID', (req, res) => {
    Users.findOne({Username: req.params.name})
    .then(user => {
        console.log(user);
        const index = user.FavoriteMovies.indexOf(req.params.MovieID)
        if(index > -1){
            user.FavoriteMovies.splice(index, 1);
        }
        res.status(200).send(user);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

// Delete user's account by name
app.delete('/users/delete/:name', (req, res) => {
    Users.findOneAndRemove({Username: req.params.name})
    .then(user => {
        if (!user) {
            res.status(400).send(req.params.name + ' was not found');
        } else {
            res.status(200).send(req.params.name + ' was deleted.');
        }
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});


app.use(express.static('public'));

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('something went wrong');
});

app.listen(8080, ()=>{
    console.log('app is listening on 8080');
})