const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require("bcryptjs");
const app = express();

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

//Allows for static html files to be accessed via the url directly
app.use(express.static("public"));

app.use(expressLayouts);

//Allows the app to access the body of an html element
app.use(express.urlencoded({ extended: true }));

//Sets the view engine to be ejs
app.set("view engine", "ejs");

// app.use(logger);
const profileRouter = require("./routes/profile");

app.use("/profile", profileRouter);

let users = [];

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        let inputEmail = req.body.email;
        let inputPassword = req.body.password;
        let user = inputEmail.split("@")[0];
        if (
            users.includes(
                JSON.stringify({ email: inputEmail, password: inputPassword })
            )
        )
            res.redirect(`/profile/${user}`);
        else {
            res.render("login", {
                email: `${inputEmail}`,
                password: `${inputPassword}`,
                error: "Incorrect email or password!",
            });
        }
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        let inputPassword = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        let inputEmail = req.body.email;
        if (confirmPassword === inputPassword) {
            users.push(
                JSON.stringify({ email: inputEmail, password: inputPassword })
            );
            res.redirect("/login");
        } else {
            res.render("register", {
                email: `${inputEmail}`,
                password: `${inputPassword}`,
                confirm: `${confirmPassword}`,
                error: "Passwords do not match!",
            });
        }
    });

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
