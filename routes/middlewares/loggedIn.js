
module.exports = (req, res, next) => {
    console.log(req.session);
    console.log(`Session checker: ${ req.session.userId }`);
    if (req.session.userId) {
        console.log(`Found user session: ${ req.session.userId }`);
        next();
    } else {
        console.log(`No user found`);
        res.redirect('/login');
    }
}
