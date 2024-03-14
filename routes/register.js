const express = require("express");
const router = express.Router();

//keep dynamic routes at the bottom as it reads top to bottom
router
    .route("/")
    .get((req, res) => {
        res.render("register.ejs", { email: "example@gmail.com" });
    })
    .post((req, res) => {
        let inputPassword = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        let inputEmail = req.body.email;
        if (confirmPassword === inputPassword)
            res.redirect(`/profile/${inputEmail.split("@")[0]}`);
        else {
            res.render("register.ejs", {
                email: `${inputEmail}`,
                password: `${inputPassword}`,
                confirm: `${confirmPassword}`,
                error: "Passwords do not match!",
            });
        }
    });

module.exports = router;
