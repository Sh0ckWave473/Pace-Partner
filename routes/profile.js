const express = require("express");
const router = express.Router();

//keep dynamic routes at the bottom as it reads top to bottom
router.get("/:user", (req, res) => {
    res.send(`${req.params.user} Signed in`);
});

router.param("user", (req, res, next, user) => {
    if (user === "justin") {
        console.log("Hi dev!");
    }
    next();
});

module.exports = router;
