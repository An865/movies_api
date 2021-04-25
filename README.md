# movie_api

### Objective
The purpose of this project is to built a web application that uses a server-side API.  The
application stores data about classic movies (pre-1970) as well as users in a database.  Users can
sign up, update personal information, and create a list of their favorite classic movies.

### Requirements
This project requires MongoDB to be installed.

### Dependencies
* bcrypt
* body-parser
* cors
* express
* express-validator
* jsonwebtoken
* mongoose
* morgan
* passport
* passport-jwt
* passport-local
* uuid

### Essential Features of the App
1. Return a list of ALL movies to the user
2. Return data (description, genre, director, image URL, whether it’s featured or not) about a
single movie by title to the user
3. Return data about a genre (description) by name/title (e.g., “Thriller”)
4. Return data about a director (bio, birth year, death year) by name
5. Allow new users to register
6. Allow users to login
7. Allow users to update their user info (username, password, email, date of birth)
8. Allow users to add a movie to their list of favorites
9. Allow users to remove a movie from their list of favorites
10. Allow existing users to deregister

### Endpoints
See Documentation for endpoints