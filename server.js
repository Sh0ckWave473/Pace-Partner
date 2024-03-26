const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const app = express();

//Load in the environment variables and set them to dotenv
//require('dotenv').config();
const initializePassport = require("./passport-config");
initializePassport(
    passport,
    (email) => users.find((user) => user.email === email),
    (id) => users.find((user) => user.id === id)
);

const uri = require("./config/keys").MongoURI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

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
        secret: require("./config/keys").hash,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// const profileRouter = require("./routes/profile");
// app.use("/profile", profileRouter);

let users = [];

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    // .post((req, res) => {
    //     let inputEmail = req.body.email;
    //     let inputPassword = req.body.password;
    //     let user = inputEmail.split("@")[0];
    //     if (
    //         users.includes(
    //             JSON.stringify({ email: inputEmail, password: inputPassword })
    //         )
    //     )
    //         res.redirect(`/profile/${user}`);
    //     else {
    //         res.render("login", {
    //             email: `${inputEmail}`,
    //             password: `${inputPassword}`,
    //             error: "Incorrect email or password!",
    //         });
    //     }
    // });
    .post(
        passport.authenticate("local", {
            successRedirect: "/profile/",
            failureRedirect: "/login",
            failureFlash: true,
        })
    );
app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post(async (req, res) => {
        let inputPassword = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        let inputEmail = req.body.email;
        if (confirmPassword === inputPassword) {
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                users.push({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword,
                    id: Date.now().toString(),
                });
                console.log(users);
                res.render("./login");
            } catch (e) {
                res.render("register", {
                    username: `${req.body.username}`,
                    email: `${inputEmail}`,
                    password: `${inputPassword}`,
                    confirm: `${confirmPassword}`,
                    error: "Error",
                });
            }
        } else {
            res.render("register", {
                username: `${req.body.username}`,
                email: `${inputEmail}`,
                password: `${inputPassword}`,
                confirm: `${confirmPassword}`,
                error: "Passwords do not match!",
            });
        }
    });

app.route("/profile").get(checkAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user.username });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
