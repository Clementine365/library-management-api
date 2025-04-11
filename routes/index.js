const passport = require('passport')
const router = require('express').Router();

// Router for users

// Router for staff

// Router for books
router.use('/books', require('./books'));

// Router for lending records
router.use('/', require('./swagger'));
router.use('/users', require('./users'));

router.get('/login', passport.authenticate('github'), (req, res) => {});

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;
