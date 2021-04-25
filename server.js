const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3300
require('dotenv').config()
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')


// Database Connection
const conctString = process.env.DATABASE_CONNECTION

    try {
          mongoose.connect(conctString ,{
             useCreateIndex: true,
             useNewUrlParser: true,
             useFindAndModify: true,
             useUnifiedTopology: true
         })
         console.log(' MongoDb Connect Successfuly')
    } catch (error) {
        console.log(' MongoDb Connect Failed')
        console.log(error)
        process.exit(1)
    }


// sesssion store

let mongoStore = new MongoDbStore({
    mongooseConnection: mongoose.connection,
    collection: "sessions"
})

// session config
app.use(session({
    secret:  process.env.SECRET_KEY,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24}

}))


// Passport Config
  
const passportConfig = require('./app/config/passport')
 passportConfig(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use(flash())

//Assets used
app.use(express.static('public'))

// Global Midlleware
   app.use((req,res,next) =>{
       res.locals.session = req.session
      res.locals.user = req.user
       next()
   })

//Template Engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false}))
app.use(express.json())

 require('./routes/web')(app)




app.listen(PORT, () =>{
    console.log(`Listnning on port ${PORT}`);
})