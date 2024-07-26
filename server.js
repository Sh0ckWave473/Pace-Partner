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
        if (req.isAuthenticated()) {
            User.findOne({ username: req.user.username }).then((user) => {
                if (user.vO2) {
                    const pythonProcess = spawn("python", [
                        "app.py",
                        "./CSV/RunningPaces.csv",
                        0,
                        0,
                        user.vO2,
                    ]);

                    pythonProcess.stdout.on("data", (data) => {
                        console.log(`Data from Python script: ${data}`);
                        data = data + "";
                        let arr = data.split(" ");
                        res.render("paceCalc", {
                            vO2: arr[0],
                            easy: arr[1],
                            marathon: arr[2],
                            threshold: arr[3],
                            interval: arr[4],
                            repeat: arr[5],
                            pr1500: arr[6],
                            pr1: arr[7],
                            pr3k: arr[8],
                            pr2: arr[9],
                            pr5k: arr[10],
                            pr10k: arr[11],
                            prHalf: arr[12],
                            prMarathon: arr[13],
                            user: req.user.username,
                            mileToKilometer,
                            timeToMile,
                        });
                    });
                } else
                    res.render("paceCalc", {
                        mileToKilometer,
                        timeToMile,
                        user: req.user.username,
                    });
            });
        } else
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
                prH: inputPRHour,
                prM: inputPRMinute,
                prS: inputPRSecond,
                distance: inputDistance,
                user: req.user.username,
                messages: error,
                mileToKilometer,
                timeToMile,
            });
        } else {
            const pythonProcess = spawn("python", [
                "app.py",
                "./CSV/RunningPaces.csv",
                inputDistance,
                inputPR,
                0,
            ]);

            pythonProcess.stdout.on("data", (data) => {
                console.log(`Data from Python script: ${data}`);
                data = data + "";
                let arr = data.split(" ");
                res.render("paceCalc", {
                    vO2: arr[0],
                    easy: arr[1],
                    marathon: arr[2],
                    threshold: arr[3],
                    interval: arr[4],
                    repeat: arr[5],
                    pr1500: arr[6],
                    pr1: arr[7],
                    pr3k: arr[8],
                    pr2: arr[9],
                    pr5k: arr[10],
                    pr10k: arr[11],
                    prHalf: arr[12],
                    prMarathon: arr[13],
                    prH: inputPRHour,
                    prM: inputPRMinute,
                    prS: inputPRSecond,
                    distance: inputDistance,
                    user: req.user.username,
                    messages: error,
                    mileToKilometer,
                    timeToMile,
                });
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error(`Error: ${data}`);
            });
        }
    });

let calendar = "";

app.route("/save-calendar").post((req, res) => {
    let numDays = req.body.numDays;
    let daysWithContent = req.body.daysWithContent;
    let content = req.body.content;
    console.log("Saved: " + numDays + ":" + daysWithContent + ":" + content);
    User.findOneAndUpdate(
        { username: req.user.username },
        {
            numDays: numDays,
            daysWithContent: daysWithContent,
            content: content,
        },
        { new: true }
    )
        .then((user) => {
            console.log("Calendar saved for user: " + user.username);
            calendar = parseCalendar(
                user.numDays,
                user.daysWithContent,
                user.content
            );
        })
        .catch((err) => {
            console.log("Error: " + err);
        });
});

app.route("/save-vDOT").post((req, res) => {
    let vO2 = req.body.vO2;
    console.log("Saved: " + vO2);
    User.findOneAndUpdate(
        { username: req.user.username },
        { vO2: vO2 },
        { new: true }
    )
        .then((user) => {
            console.log("Calendar saved for user: " + user.username);
        })
        .catch((err) => {
            console.log("Error: " + err);
        });
});

app.route("/calendar")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            console.log("Finding User...");
            User.findOne({ username: req.user.username }).then((user) => {
                console.log("User found: " + user.username);
                if (user.numDays) {
                    calendar = parseCalendar(
                        user.numDays,
                        user.daysWithContent,
                        user.content
                    );
                    res.render("calendar", {
                        user: user.username,
                        calendar: calendar,
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

const parseCalendar = (numDays, daysWithContent, content) => {
    let daysGenerated = 0;
    let weeksGenerated = 0;
    let calendar = "";
    console.log("Parsing: " + numDays + ":" + daysWithContent + ":" + content);
    while (daysGenerated != numDays) {
        if (daysGenerated % 7 === 0) {
            if (weeksGenerated !== 0) calendar += `</tr>`;
            weeksGenerated++;
            calendar += `<tr id="week${weeksGenerated}">`;
        }
        daysGenerated++;
        if (daysWithContent[0] && daysWithContent[0] === daysGenerated) {
            calendar += `<td id="day${daysGenerated}" class="day-style"><div id="day${daysGenerated}-header" class="day-header">
                            Day ${daysGenerated}</div><div id="day${daysGenerated}-content" class="day-content">${content[0]}</div></td>`;
            daysWithContent.shift();
            content.shift();
        } else
            calendar += `<td id="day${daysGenerated}" class="day-style"><div id="day${daysGenerated}-header" class="day-header">
                            Day ${daysGenerated}</div><div id="day${daysGenerated}-content" class="day-content"></div></td>`;
    }
    return calendar + `</tr>`;
};

const mileToKilometer = (milePace) => {
    if (!milePace || milePace.indexOf(":") === -1) return "??";
    let milePaceArr = milePace.split(":");
    let milePaceSec = parseInt(milePaceArr[0]) * 60 + parseInt(milePaceArr[1]);
    let kilometerPaceSec = milePaceSec / 1.60934;
    let kilometerPaceMin = Math.floor(kilometerPaceSec / 60);
    let kilometerPaceSecRemainder = Math.round(kilometerPaceSec % 60);
    if (kilometerPaceSecRemainder < 10) {
        return `${kilometerPaceMin}:0${kilometerPaceSecRemainder}`;
    }
    return `${kilometerPaceMin}:${kilometerPaceSecRemainder}`;
};

const timeToMile = (distance, time) => {
    if (!distance || !time) return "??";
    let timeArr = time.split(":");
    let timeSec = 0;
    if (timeArr.length === 2)
        timeSec = parseInt(timeArr[0]) * 60 + parseInt(timeArr[1]);
    else
        timeSec =
            parseInt(timeArr[0]) * 3600 +
            parseInt(timeArr[1]) * 60 +
            parseInt(timeArr[2]);
    let paceSec = timeSec / distance;
    let paceMin = Math.floor(paceSec / 60);
    let paceSecRemainder = Math.round(paceSec % 60);
    if (paceSecRemainder < 10) {
        return `${paceMin}:0${paceSecRemainder}`;
    }
    return `${paceMin}:${paceSecRemainder}`;
};
