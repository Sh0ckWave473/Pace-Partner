const express = require("express");
const app = express();

//Allows for static html files to be accessed via the url directly
app.use(express.static("public"));

//Allows the app to access the body of an html element
app.use(express.urlencoded({extended: true}));

//Sets the view engine to be ejs
app.set('view engine', 'ejs');

app.use(logger);

const signinRouter = require('./routes/signin');

app.use('/signin', signinRouter);

function logger(req, res, next) {
    console.log(req.originalUrl);
    next();
}

app.listen(3000);