const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./model/user");

function initialize(passport) {
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                User.findOne({ email: email }).then((user) => {
                    if (!user)
                        return done(null, false, {
                            message: "Invalid email.",
                        });
                    bcrypt.compare(
                        password,
                        user.password,
                        function (e, isMatch) {
                            if (e) throw e;
                            if (!isMatch) {
                                console.log("User not found!");
                                return done(null, false, {
                                    message: "Incorrect password.",
                                });
                            }
                            console.log("User found!");
                            return done(null, user);
                        }
                    );
                });
            }
        )
    );
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) =>
        User.findById(id).then((user) => done(null, user))
    );
}

module.exports = initialize;
