// importing modules
let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema(
    {
        username: { type: String, unique: true, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, unique: false },
        numDays: { type: Number, required: false, unique: false },
        daysWithContent: { type: [Number], required: false, unique: false },
        content: { type: [String], required: false, unique: false },
        vO2: { type: Number, required: false, unique: false },
        resetPasswordToken: { type: String, required: false, unique: false },
        resetPasswordExpires: { type: Date, required: false, unique: false },
    },
    { strict: false }
);

// plugin for passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

// export userschema
module.exports = mongoose.model("User", userSchema);
