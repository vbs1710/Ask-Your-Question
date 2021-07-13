if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const query = require('./models/query');
const methodOverride = require('method-override');
const ans = require('./models/ans');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const {querySchema,answerSchema}=require('./schemaJoi');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('./models/users');

const userRoutes = require('./routes/user');
const ansRoutes = require('./routes/answer');
const queryRoutes = require('./routes/question');

mongoose.connect('mongodb://localhost:27017/Quora',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", () =>{
    console.log("database connected");
})

const app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.engine('ejs',ejsMate);
app.use(express.urlencoded({ extended:true }));
app.use(methodOverride('_method'));

const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,  // jab deploy krenge tab isko uncomment kr skte h ..kyuki localhost http pr rhta h na ki https pr toj jab hum deploy krenge toh vo https pr rhega to humara secure wala part bhi done ho jaayega....agar isko localhost mei true kr dunga toh login krne pr bhi login nhi hoga aur mei khudke account se banaya hua campground,review edit aur delete nhi kr paaunga....
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
// jo niche 3 line likhi h inko res.locals wale part ke upar hi likhna h hamesha warna authorisation wale part mei problem aayegi....successfully wasted 4 days on this
app.use(passport.initialize());
app.use(passport.session()); // isko   app.use(session(sessionConfig)); iske baad hi likhna h varna isko pata nhi rhega ki session kya h
passport.use(new LocalStrategy(User.authenticate()));

app.use((req,res,next)=>{
    // console.log(req.session) isko consolelog krne pr session mei hum returnTo wala deks skte h agar vo trigger hua hoga toh 
    res.locals.success = req.flash('success');     // ye middleware lagane se mei flash mei jo bhi string pass krunga usko kisi bhi template mei access kr skta hu...for eg mujhe show tempelate ke router mei koi variable pass nhi krana padega ki jisse mei flash wali string ko access kr sku....middleware ki help se direct access ho jaayega
    res.locals.error = req.flash('error');
    res.locals.currentuser = req.user; // req.user humei user ka email , username , id(mongoose wali) .... ab mei ise pure project mei kahi bhi use kr skta hu...ab hum login aur register wala option navbar mei tab hi dikhayenge jab currentUser exist nhi krega ..aur agar currentUser exist krega toh hum sirf logout wala option show krenge.... req.user humei passport ki help se mila h ... passport sab kuch behind the scene kr deta h .....
    next();
})



passport.serializeUser(User.serializeUser());   // cookie ko bana dega aur store kr lega login krne pr
passport.deserializeUser(User.deserializeUser()); // cookie ko destroy kr dega logout krne pr :)



app.use('/',userRoutes);
app.use('/',ansRoutes);
app.use('/',queryRoutes);

// render to the main show page
app.get('/',catchAsync(async(req,res)=>{
    const quest = await query.find({}).populate({
        path:'answer',
        populate:{
            path:'author'
        }
    }).populate('author');
    // console.log(quest); 
    res.render('mainPage2',{quest})
}))





app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(3000,()=>{
    console.log("App listening on port 3000");
})


// saara main kaam ho gya bass show page pr button hide krna wala logic kaam nhi kr rha(AB KAR GYA)
//  ..... isko sahi krne ke baad image add krne ka option lagana h question aur answer dono ke form mei(DONE)
//  ..fir styling krni h bootstrap se .... fir security wala part....