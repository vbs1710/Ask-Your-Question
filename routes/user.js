const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const User = require('../models/users');

router.get('/register',(req,res)=>{
    res.render('users/register');
})

router.post('/register',catchAsync(async(req,res)=>{
    try{
        const {email,username,password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);  // ye password ko salt krke hash bhi kr deta h...pehle user bana lia uss username  aur email ka aur fir baad mei password set kr dia
        req.login(registeredUser,err=>{
            if(err) return next(err); // next se humare error humare error handler pr chala jaayega... it sounds awkward that if a user is registered successfully in above line then how can an error occur..so anything could go wrong thats why we included err.... ab hum login isliye use kr rhe kyuki agar mei register kr dia... fir mei new campground banaunga toh vo mujhe login page pr le jaayyega which is not a good experience....so to resolve this problem we are writing this code which also log in if we register ass a new user...agar hum register kr liye h toh humei direct login bhi ho jaana chahiye(thats our final aim to write this code)...
            req.flash('success','Welcome to Questionaire!!')
            // console.log(registeredUser); isko console log kroge toh humare user mei salt hash wala column khud passport add kr dega... ye (passport) saaraa kaam hidden way mei krta h ..sab kuch piche ki side ho jaata h ...humko bas apne methods sahi se lagane h passport ke
            res.redirect('/');
        })
    }catch(e){
        req.flash('error',e.message);   // jo error hum flash krwa rhe h vo error passport wagera jo hum use kr rhe vo display krwa rha ki konsa error aaya ..jese agar same username hoga toh vo bolega ki 2 username same nhi ho skte.....
        res.redirect('register')
    }
}));

router.get('/login',(req,res)=>{
    res.render('users/login');
});

router.post('/login',passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),(req,res)=>{
    req.flash('success','Welcome !!');
    const redirectUrl = req.session.returnTo || '/'  // agar session mei returnTo h toh uspr redirect krega varna /campground pr(jab koi direct login prr tap krega aur login krega toh returnTo exist nhi krega kyuki vo direct login krne gaya h na ki kahi(kahi matlab ki vo login nhi hoga aur new pr tap kra hoga) se redirect hokr login pr gya)
    delete req.session.returnTo; // session mei se delete denge hum returnTo ko kyuki humne usko redirectUrl mei store kr lia h
    res.redirect(redirectUrl);
});

router.get('/logout',(req,res)=>{
    req.logout(); // bas logout ke liye itna hi krna h humei...passport sab kuch kr dega baaki lol ...
    req.flash('success','You have been logged out');
    res.redirect('/');
});

module.exports = router;