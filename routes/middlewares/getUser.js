const User = require('../../model/user');
const Sessions = require('../../model/sessions');

module.exports = async (req, res, next) => {
    if (req.session.session) {
        try {
            const session = await Sessions.findOne({
                cookie: req.session.session
            });
            res.locals.username = session.username;
            next();
        } catch (err) {
            console.log('User not logged in');
            res.redirect('/login');
        }
    }
    else {
        console.log('User not logged in');
        res.redirect('/login');
    }
}
