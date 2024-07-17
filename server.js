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

const PORT = process.env.PORT || 3000;

const User = require("./model/user");

const initializePassport = require("./passport-config");
initializePassport(passport);

const { spawn } = require("child_process");

//Connecting to the database
const db = process.env.MONGO_URI;
mongoose
    .connect(db)
    .then(() => console.log("MongoDB connected!"))
    .catch((e) => console.log(e));

//Sets the view engine to be ejs
app.set("view engine", "ejs");
//Allows for static html files to be accessed via the url directly
app.use(
    express.static("public", {
        setHeaders: (res, path) => {
            if (path.endsWith(".js")) {
                res.setHeader("Content-Type", "application/javascript");
            }
        },
    })
);
app.use(expressLayouts);
//Allows the app to access the body of an html element
app.use(express.json());
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
            successRedirect: "/paceCalc",
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

app.route("/forgotPassword")
    .get((req, res) => {
        if (req.isAuthenticated())
            res.render("paceCalc", { user: req.user.username });
        else res.render("forgotPassword");
    })
    .post((req, res) => {
        let inputEmail = req.body.email;
        let error = "";
        if (inputEmail === "") error = "Email is required!";
        else {
            User.findOne({ email: inputEmail }).then((user) => {
                if (!user)
                    res.render("forgotPassword", {
                        email: `${inputEmail}`,
                        messages: "Email does not exist!",
                    });
                else {
                    res.render("resetPassword", { email: `${inputEmail}` });
                }
            });
        }
        if (error !== "")
            res.render("forgotPassword", {
                email: `${inputEmail}`,
                messages: error,
            });
    });

app.route("/paceCalc")
    .get((req, res) => {
        if (req.isAuthenticated())
            res.render("paceCalc", { user: req.user.username });
        else
            res.render("login", {
                messages: "You must be logged in to view this page!",
            });
    })
    .post((req, res) => {
        let inputDistance = req.body.distance;
        let inputPRHour = req.body.prH;
        let inputPRMinute = req.body.prM;
        let inputPRSecond = req.body.prS;
        if (!inputPRHour) inputPRHour = 0;
        if (!inputPRMinute) inputPRMinute = 0;
        if (!inputPRSecond) inputPRSecond = 0;
        let inputPR =
            parseInt(inputPRHour) * 3600 +
            parseInt(inputPRMinute) * 60 +
            parseInt(inputPRSecond);
        console.log("Distance " + inputDistance);
        let inputVO2 = req.body.vO2;
        let inputDays = req.body.days;
        let inputWorkouts = req.body.workouts;
        let error = "";

        if (inputPR === 0) {
            error = "Input a valid PR time";
            inputPR = 0;
            res.render("paceCalc", {
                easy: 0,
                marathon: 0,
                threshold: 0,
                interval: 0,
                repeat: 0,
                twoMilePR: 0,
                v02: 0,
                prH: inputPRHour,
                prM: inputPRMinute,
                prS: inputPRSecond,
                distance: inputDistance,
                user: req.user.username,
                messages: error,
            });
        } else {
            const pythonProcess = spawn("python", [
                "app.py",
                "./CSV/RunningPaces.csv",
                inputDistance,
                inputPR,
            ]);

            pythonProcess.stdout.on("data", (data) => {
                console.log(`Data from Python script: ${data}`);
                data = data + "";
                let arr = data.split(" ");
                res.render("paceCalc", {
                    easy: arr[1],
                    marathon: arr[2],
                    threshold: arr[3],
                    interval: arr[4],
                    repeat: arr[5],
                    v02: arr[0],
                    prH: inputPRHour,
                    prM: inputPRMinute,
                    prS: inputPRSecond,
                    distance: inputDistance,
                    user: req.user.username,
                    messages: error,
                });
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error(`Error: ${data}`);
            });
        }
    });

let calendar = "";

app.route("/preserve-calendar").post((req, res) => {
    calendar = req.body.calendar;
});
app.route("/save-calendar").post((req, res) => {
    let numWeeks = req.body.numWeeks;
    let daysWithContent = req.body.content;
    console.log("Saved: " + numWeeks + ":" + daysWithContent);
    User.findOneAndUpdate(
        { username: req.user.username },
        { numWeeks: numWeeks, daysWithContent: daysWithContent },
        { new: true }
    )
        .then((user) => {
            console.log("Calendar saved for user: " + user.username);
            calendar = parseCalendar(user.numWeeks, user.daysWithContent);
            res.render("calendar", {
                user: user.username,
                calendar: calendar,
                messages: "Calendar saved successfully",
            });
        })
        .catch((err) => {
            console.log("Error: " + err);
            res.render("calendar", {
                user: user.username,
                messages: "Error when saving calendar",
            });
        });
});

app.route("/calendar")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            console.log("Finding User...");
            User.findOne({ username: req.user.username }).then((user) => {
                console.log("User found: " + user.username);
                if (user.numWeeks) {
                    calendar = parseCalendar(
                        user.numWeeks,
                        user.daysWithContent
                    );
                    res.render("calendar", {
                        user: user.username,
                        calendar: calendar,
                        messages: "Previously saved calendar found",
                    });
                } else
                    res.render("calendar", {
                        user: req.user.username,
                        messages: "No previously saved calendar found!",
                    });
            });
        } else {
            res.render("login", {
                messages: "You must be logged in to view this page!",
            });
        }
    })
    .post((req, res) => {
        let inputDays = req.body.calendarLength;
        inputDays = parseInt(inputDays);
        if (isNaN(inputDays) || inputDays < 7) {
            res.render("calendar", {
                user: req.user.username,
                messages: "Input a number between 7 and 31 inclusive",
            });
        } else if (inputDays > 31) {
            res.render("calendar", {
                user: req.user.username,
                messages: "Input a number between 7 and 31 inclusive",
            });
        } else {
            res.render("calendar", {
                user: req.user.username,
                messages: "Generated",
            });
        }
    });

app.delete("/logout", (req, res) => {
    calendar = "";
    req.logOut(function (e) {
        if (e) return next(e);
        res.redirect("/");
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return res.redirect("/paceCalc");
    return next();
}

app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}, http://localhost:3000`);
});

const parseCalendar = (numWeeks, daysWithContent) => {
    let daysGenerated = 0;
    let weeksGenerated = 0;
    let calendar = "";
    let contentArr = daysWithContent?.split(",");
    console.log("Parsing: " + numWeeks + ":" + contentArr);
    while (daysGenerated != numWeeks * 7) {
        if (daysGenerated % 7 == 0) {
            if (weeksGenerated !== 0) calendar += `</tr>`;
            weeksGenerated++;
            calendar += `<tr id="week${weeksGenerated}">`;
        }
        daysGenerated++;
        let firstElement = null;
        if (contentArr[0]) firstElement = contentArr[0].split(":");
        if (firstElement && parseInt(firstElement[0]) === daysGenerated) {
            calendar += `<td id="day${daysGenerated}" class="day-style"><div id="day${daysGenerated}-header" class="day-header">
                            Day ${daysGenerated}</div><div id="day${daysGenerated}-content" class="day-content">${firstElement[1]}</div></td>`;
            contentArr.shift();
        } else
            calendar += `<td id="day${daysGenerated}" class="day-style"><div id="day${daysGenerated}-header" class="day-header">
                            Day ${daysGenerated}</div><div id="day${daysGenerated}-content" class="day-content"></div></td>`;
    }
    return calendar + "</tr>";
};
