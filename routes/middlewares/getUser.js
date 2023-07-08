const User = require('../../model/user');

module.exports = async (req, res, next) => {
    console.log(req.session);
    console.log(`Session checker: ${ req.session.userId }`);
    if (req.session.userId) {
        try {
            const user = await User.findOne({
                _id: req.session.userId
            }).exec();
            res.locals.user = user;
            next();
        } catch (err) {
            console.log(`No user found`);
            res.redirect('/login');
        }
    } else {
        console.log(`No user found`);
        res.redirect('/login');
    }
}
