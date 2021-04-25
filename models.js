const mongoose = require('mongoose'); //returns singleton object
const bcrypt = require('bcrypt');

//schema for movies
let movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String,
    Birth: Date,
    Death: Date,
  },
  ImagePath: String,
  Featured: Boolean
});

  //schema for users
  let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birth: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
 
//mongoose class static to generate hash of password
userSchema.statics.hashPassword = password => {
  return bcrypt.hashSync(password, 10); //hashSync synchronously generates hashed string
};

//mongoose instance method for password validation
userSchema.methods.validatePassword = function(password) { //reminder do not use arrow function
  return bcrypt.compareSync(password, this.Password);
};

/*call mongoose.model() on schema for Mongoose to compile and create models. 
Note mongoose looks for plural lowercase mongo collection ('movies' 'users') */
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

//export models
module.exports.Movie = Movie;
module.exports.User = User;