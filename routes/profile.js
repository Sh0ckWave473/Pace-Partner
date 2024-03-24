const express = require("express");
const router = express.Router();

//keep dynamic routes at the bottom as it reads top to bottom
router.get("/:user", (req, res) => {
    res.render("dashboard", { user: req.params.user });
});

module.exports = router;
