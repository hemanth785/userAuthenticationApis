const dotenv = require("dotenv");
const app = require("./index");
const mongoose = require("mongoose");

dotenv.config({path: "config.env"});

const DB = process.env.DATABASE;
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("Database connection successful");
})

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
});
// hadling unhandled rejections
process.on('unhandledRejection',err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1); //1 stands for unhandled exeption, 0 - stands for success.
    })
});

// hadling unhandled rejections
process.on('uncaughtException',err => {
    console.log(err);
    server.close(() => {
        process.exit(1); //1 stands for unhandled exeption, 0 - stands for success.
    })
});