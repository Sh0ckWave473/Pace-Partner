const express = require("express");
const router = express.Router();

//keep dynamic routes at the bottom as it reads top to bottom
router.get("/:user", (req, res) => {
    res.send(`${req.params.user} Signed in`);
});

module.exports = router;
