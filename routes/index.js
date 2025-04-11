const passport = require('passport')
const router = require('express').Router();

<<<<<<< Updated upstream
// Router for users

// Router for staff

// Router for books

// Router for lending records
router.use('/', require('./swagger'));

router.use('/books', booksRoutes);
=======
router.use('/books', require('./books'));
>>>>>>> Stashed changes
router.use('/users', require('./users'));

router.get('/login', passport.authenticate('github'), (req, res) => {});

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;
