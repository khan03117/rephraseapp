const express = require('express')
const { server, app } = require('./socket');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const mongoose = require('mongoose');
const path = require('path');

const fs = require('fs');
const cors = require('cors');
require('dotenv').config();


process.env.TZ = "Asia/Kolkata";
const mongourl = "mongodb+srv://noreplycabs24:KkhHGcKLcnzppeLk@cluster0.at7dp.mongodb.net/refreshapp";
mongoose.connect(mongourl);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log('MongoDB connection error:', error);
});
database.once('connected', () => {
    console.log('Database connected');
});
// Swagger Configuration

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
process.env.TZ = "Asia/Kolkata";
const port = 7887;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
const userroutes = require('./src/routes/UserRoutes');
const doctorroutes = require('./src/routes/DoctorRoutes');
const specializationroutes = require('./src/routes/SpecializationRoutes');
const blogroutes = require('./src/routes/BlogRoutes');
const videoRoutes = require('./src/routes/VideoRoutes');
const prescription = require('./src/routes/PrescriptionRoutes');
const slotroutes = require('./src/routes/SlotRoutes');
const bookingRoutes = require('./src/routes/BookingRoutes');
const faqroutes = require('./src/routes/FaqRoutes');
const agoraRoutes = require('./src/routes/AgoraRoutes');


app.use('/api/v1/user', userroutes);
app.use('/api/v1/doctor', doctorroutes);
app.use('/api/v1/specialization', specializationroutes);
app.use('/api/v1/blog', blogroutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/prescription', prescription);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/slot', slotroutes);
app.use('/api/v1/faq', faqroutes);
app.use('/api/v1/agora', agoraRoutes);
app.get('/', (req, res) => res.send('Rephrase App Started'))
// app.listen(port, () => console.log(`Rephrase app listening on port ${port}! http://localhost:7887/`))
server.listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});
