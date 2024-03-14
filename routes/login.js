const express = require("express");
const router = express.Router();

router
    .route("/")
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

module.exports = router;
