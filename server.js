const express = require("express");
const app = express();

//Allows for static html files to be accessed via the url directly
app.use(express.static("public"));

//Allows the app to access the body of an html element
app.use(express.urlencoded({ extended: true }));

//Sets the view engine to be ejs
app.set("view engine", "ejs");

// app.use(logger);

const loginRouter = require("./routes/login");

app.use("/login", loginRouter);

const profileRouter = require("./routes/profile");

app.use("/profile", profileRouter);

const registerRouter = require("./routes/register");

app.use("/register", registerRouter);

// function logger(req, res, next) {
//     console.log(req.originalUrl);
//     next();
// }

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
