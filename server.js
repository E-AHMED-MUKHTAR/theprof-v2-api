const express = require('express')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/dataBaseConnection');
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;
connectDB()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'Amuk+++000',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_CONNECTION,
      collectionName: 'sessions',
      ttl: 3 * 60 * 60,
    }),
    cookie: {
      maxAge: 3 * 60 * 60 * 1000,
    },
  })
);
const errorHand = require('./middlewares/errors');
app.use(errorHand)
app
  .use(
    "/theprof/students",
    require("./routers/applicant")
  )
app
  .use(
    "/theprof/teachers",
    require("./routers/master")
  )
app
  .use(
    "/theprof/admin",
    require("./routers/admin")
  )
app.listen(port, () => console.log(`${port}!`))


