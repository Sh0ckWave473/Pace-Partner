const express = require('express');
const router = express.Router();

router.route('/').get((req, res) => {
    res.render('signin.ejs', {email: 'example@gmail.com'});
}).post((req, res) => {
    let input = req.body.email;
    if(input === 'justinih2003@gmail.com')
        res.redirect(`/signin/${input}`);
    else{
        res.render('signin.ejs', {email: `${input}`});
        console.log('error');
    }
});

//keep dynamic routes at the bottom as it reads top to bottom
router.get('/:user', (req, res) =>{
    res.send(`${req.params.user} Signed in`);
});

router.param('user', (req, res, next, user) => {
    if(user === 'justin'){
        console.log("Hi dev!");
    }
    next();
})

module.exports = router;