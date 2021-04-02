const express = require('express');
const app = express();
const morgan = require('morgan');

let topMovies = [
    {
        title: 'Psycho',
        year: '1960'
    },
    {
        title: 'The Birds',
        year: '1963'
    },
    {
        title: 'North by Northwest',
        year: '1959'
    },
    {
        title: 'Rebecca',
        year: '1940'
    },
    {
        title: 'Rear Window',
        year: '1954'
    }
];

//logging with morgan
app.use(morgan('common'));

//GET requests
app.get('/', (req, res)=>{
    res.send('Welcome to myFlix');
})

app.get('/movies', (req, res)=>{
    res.json(topMovies)
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