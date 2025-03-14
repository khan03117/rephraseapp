const express = require('express')
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const mongourl = "mongodb+srv://franticnoida2016:franticnoida2016@cluster0.9n1kpyn.mongodb.net/refreshapp";
mongoose.connect(mongourl);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log('MongoDB connection error:', error);
});
database.once('connected', () => {
    console.log('Database connected');
});

process.env.TZ = "Asia/Kolkata";
const port = 7887;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => res.send('Rephrase App Started'))
app.listen(port, () => console.log(`Rephrase app listening on port ${port}!`))