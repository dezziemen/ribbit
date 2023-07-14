module.exports = async (req, res, next) => {
    if (typeof req.session.username !== 'undefined') {
        res.locals.username = req.session.username;
        next();
    }
    else {
        console.log('User not logged in');
        res.redirect('/login');
    }
}
