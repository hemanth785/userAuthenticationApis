const express = require('express');

const app = express();

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});

app.get("/", (req, res) => {
    res.status(200)
       .send("welcome...!");
})
