// importing modules
let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: false },
});

// plugin for passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

// export userschema
module.exports = mongoose.model("User", userSchema);
