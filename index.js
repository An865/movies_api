/* Dependencies */
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
app.use(bodyParser.json());

let movies = [
    {
        name: 'Psycho',
        year: '1960',
        director: 'Alfred Hitchcock',
        genre: 'Horror'
    },
    {
        name: 'The Birds',
        year: '1963',
        director: 'Alfred Hitchcock',
        genre: 'Horror'
    },
    {
        name: 'North by Northwest',
        year: '1959',
        director: 'Alfred Hitchcock', 
        genre: 'Horror'
    },
    {
        name: 'Rebecca',
        year: '1940',
        director: 'Alfred Hitchcock', 
        genre: 'Horror'
    },
    {
        name: 'Rear Window',
        year: '1954',
        director: 'Alfred Hitchcock',
        genre: 'Horror'
    }
];


let users = [
    {
        name: 'John Doe',
        favoriteMovies: ['Psycho']
    }
];

//logging with morgan
app.use(morgan('common'));


/* GET requests */

// Get homepage endpoint welcome message
app.get('/', (req, res)=>{
    res.send('Welcome to myFlix');
})

// Get all movies
app.get('/movies', (req, res)=>{
    res.json(movies)
});

// Get all users
app.get('/users', (req, res)=>{
    res.json(users)
});

// Get movie by name
app.get('/movies/:name', (req, res) => {
    res.json(movies.find(movie => {
        return movie.name === req.params.name;
    }));
});

// Get movie genre
app.get('/movies/:name/genre', (req, res) => {
    let movie = movies.find(movie =>{
        return movie.name === req.params.name;
    });
    
   if (movie.hasOwnProperty('genre')){
       res.status(200).send(movie.genre);
   } else {
       res.status(400).send('movie doesn\'t have a genre');
   }

});

// Get movie director
app.get('/movies/:name/director', (req, res) => {
    let movie = movies.find(movie => {
        return movie.name === req.params.name;
    });

    if (movie.hasOwnProperty('director')){
        res.status(200).send(movie.director);
    } else {
        res.status(400).send('movie doesn\'t have a director');
    }
});


/* POST Requests*/

// Create new user
app.post('/users', (req, res) => {
    let newUser = req.body;

    if(!newUser.name){
        const message = 'missing name in request body';
        res.status(400).send(message);
    } else {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    }
});


/* PUT Requests*/

// Update/add new favorite movie in user's list
app.put('/users/:name/:movies', (req, res)=>{
    let user = users.find(user => {
        return user.name === req.params.name;
    });

    if(user.hasOwnProperty('favoriteMovies')){
        user.favoriteMovies.push(req.params.movies);
        res.status(200).send('Updated Favorite Movies: ' + user.favoriteMovies);
    } else {
        user.favoriteMovies = [req.params.movies];
        res.status(200).send('Updated Favorite Movies: ' + user.favoriteMovies);
    }
});

// Update user's name
app.put('/users/update/:oldName/:newName', (req, res) => {
    let user = users.find(user => {
        return user.name === req.params.oldName;
    });

    if(user.hasOwnProperty('name')){
        user.name = req.params.newName;
        res.status(200).send('Updated Name: ' + user.name);
    }
});

/* DELETE requests */

// Delete movie from user's list of favotires
app.delete('/users/:name/:movie', (req, res)=>{
    let user = users.find(user => {
        return user.name === req.params.name;
    })

    let index = user.favoriteMovies.indexOf(req.params.movie);
    delete user.favoriteMovies[index];
    res.status(200).send('The following movie was deleted: ' + req.params.movie);
})

// Delete user's account by name
app.delete('/users/:name', (req, res) => {
    let user = users.find(user => {
        return user.name === req.params.name;
    });

    if(user){
        users = users.filter((obj) => {
            return obj.name !== req.params.name
        })
        res.status(200).send('User ' + req.params.name + ' deleted');
    }
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