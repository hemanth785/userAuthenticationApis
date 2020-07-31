const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

//  MIDDLEWARES
app.use(morgan('dev'));
if(process.env.NODE_ENV === 'development')
{
    console.log(process.env);
}
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many requests from this IP'
})
app.use("/api",limiter);

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);

    next();
})

//HANDLING UNHANDLED ROUTES
app.all('*',(req,res,next) => {  //app.all - handle all the http requests including get,post,delete etc
    next(new appError(`cannot find ${req.originalUrl} on this server`,404));
});

module.exports = app;