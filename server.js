const express = require("express");
const app = express();

//Allows for static html files to be accessed via the url directly
app.use(express.static("public"));

//Allows the app to access the body of an html element
app.use(express.urlencoded({ extended: true }));

//Sets the view engine to be ejs
app.set("view engine", "ejs");

// app.use(logger);
const profileRouter = require("./routes/profile");

app.use("/profile", profileRouter);

app.route("/login")
    .get((req, res) => {
        res.render("login.ejs", { email: "example@gmail.com" });
    })
    .post((req, res) => {
        let inputEmail = req.body.email;
        let inputPassword = req.body.password;
        let user = inputEmail.split("@")[0];
        if (inputEmail === "justinih2003@gmail.com")
            res.redirect(`/profile/${user}`);
        else {
            res.render("login.ejs", {
                email: `${inputEmail}`,
                password: `${inputPassword}`,
                error: "Invalid email or password!",
            });
            console.log("error");
        }
    });

app.route("/register")
    .get((req, res) => {
        res.render("register.ejs", { email: "example@gmail.com" });
    })
    .post((req, res) => {
        let inputPassword = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        let inputEmail = req.body.email;
        if (confirmPassword === inputPassword) res.redirect("/login");
        else {
            res.render("register.ejs", {
                email: `${inputEmail}`,
                password: `${inputPassword}`,
                confirm: `${confirmPassword}`,
                error: "Passwords do not match!",
            });
        }
    });

// function logger(req, res, next) {
//     console.log(req.originalUrl);
//     next();
// }

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
