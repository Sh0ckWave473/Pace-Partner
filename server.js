const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
//Load in the environment variables and set them to dotenv
require("dotenv").config();
const app = express();

const User = require("./model/user");

const initializePassport = require("./passport-config");
initializePassport(passport);

//Connecting to the database
const db = process.env.MONGO_URI;
mongoose
    .connect(db)
    .then(() => console.log("MongoDB connected!"))
    .catch((e) => console.log(e));

//Sets the view engine to be ejs
app.set("view engine", "ejs");
//Allows for static html files to be accessed via the url directly
app.use(express.static("public"));
app.use(expressLayouts);
//Allows the app to access the body of an html element
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
    session({
        secret: process.env.HASH,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

let users = [];

app.route("/login")
    .get(checkAuthenticated, (req, res) => {
        res.render("login");
    })
    .post(
        checkAuthenticated,
        passport.authenticate("local", {
            successRedirect: "/profile",
            failureRedirect: "/login",
            failureFlash: true,
        })
    );

app.route("/register")
    .get(checkAuthenticated, (req, res) => {
        res.render("register", { error: "" });
    })
    .post(checkAuthenticated, async (req, res) => {
        let inputPassword = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        let inputEmail = req.body.email;
        let inputUsername = req.body.username;
        let error = "";
        if (
            inputEmail === "" ||
            inputPassword === "" ||
            confirmPassword === "" ||
            inputUsername === ""
        )
            error = "All fields are required!";
        else if (inputPassword.length < 6)
            error = "The password must be at least 6 characters long!";
        else if (confirmPassword !== inputPassword)
            error = "Passwords do not match!";
        else {
            try {
                User.findOne({ username: inputUsername }).then((user) => {
                    if (user)
                        res.render("register", {
                            username: `${inputUsername}`,
                            email: `${inputEmail}`,
                            password: `${inputPassword}`,
                            confirm: `${confirmPassword}`,
                            messages: "Username already exists!",
                        });
                });
                const hashedPassword = await bcrypt.hash(inputPassword, 10);
                User.findOne({ email: inputEmail }).then((user) => {
                    if (user)
                        res.render("register", {
                            username: `${inputUsername}`,
                            email: `${inputEmail}`,
                            password: `${inputPassword}`,
                            confirm: `${confirmPassword}`,
                            messages: "Email already exists!",
                        });
                    else {
                        const newUser = new User({
                            username: inputUsername,
                            email: inputEmail,
                            password: hashedPassword,
                        });
                        console.log(newUser);
                        newUser
                            .save()
                            .then((user) => res.render("./login"))
                            .catch((e) => console.log(e));
                    }
                });
            } catch (e) {
                error = "Error";
            }
        }
        if (error !== "")
            res.render("register", {
                username: `${inputUsername}`,
                email: `${inputEmail}`,
                password: `${inputPassword}`,
                confirm: `${confirmPassword}`,
                messages: error,
            });
    });

app.route("/profile").get((req, res) => {
    if (req.isAuthenticated())
        res.render("dashboard", { user: req.user.username });
    else
        res.render("/login", {
            messages: "You must be logged in to view this page!",
        });
});

app.delete("/logout", (req, res) => {
    req.logOut(function (e) {
        if (e) return next(e);
        res.redirect("/");
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return res.redirect("/profile");
    return next();
}

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
