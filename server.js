const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const app = express();
const cors = require('cors');
const urls = require('./routes/router');
const port = 5000;

dotenv.config();

app.use(express.json());
app.use(cors());
app.use('/api',urls);
// connecting to database...
mongoose.connect(process.env.DB_CONNECT, () => {
    console.log("succesfully connected to db...");
});

app.get('/', (req, res) => {
    res.json({
        "message": "hello world"
    })
})

app.listen(port, () => {
    console.log(`connected to port ${port}`);
})