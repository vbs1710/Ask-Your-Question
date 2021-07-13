const ExpressError = require('./utils/ExpressError');
const query = require('./models/query');
const ans = require('./models/ans');
const {querySchema,answerSchema}=require('./schemaJoi');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;  // original path store kr li session mei..
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateQuery = (req, res, next) => {
    const { error } = querySchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
module.exports.validateAns = (req, res, next) => {
    const { error } = answerSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isQuestionAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const question = await query.findById(id);  // ab problem ye h ki humne edit aur delete ke button toh hide kr diye(jo uss campground ka author ya maalik nhi h uske liye hide rhega) pr fir bhi hum upar url mei /edit wagera krke changes kr skte h toh issey resolve krne ke liye humne ye middleware banaya...
    if(!question.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isAnswerAuthor = async(req,res,next)=>{
    const {id,ansId} = req.params;
    const answer = await ans.findById(ansId);  // ab problem ye h ki humne edit aur delete ke button toh hide kr diye(jo uss review ka author ya maalik nhi h uske liye hide rhega) pr fir bhi hum upar url mei /edit wagera krke changes kr skte h toh issey resolve krne ke liye humne ye middleware banaya...
    if(!answer.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}