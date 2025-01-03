const express = require('express');
const { mongoose } = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRouter = require('./routes/userRoute');
const FolderRoutes = require('./routes/FolderRoutes');
const formRoutes = require('./routes/FormRoutes');
const SubmissionRoutes = require('./routes/SubmisstionRoutes');
const app = express();
require('dotenv').config();
const PORT =process.env.PORT;
const MONGODBURL=process.env.MONGODBURL;
app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174','https://formbot-frontend-jt3c.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));
app.use(bodyParser.json());
app.use(express.json())
app.use("/", userRouter);
app.use('/user',userRouter);
app.use('/api', FolderRoutes);
app.use('/',formRoutes);
app.use('/',SubmissionRoutes);
app.use(express.urlencoded({ extended: true }));
mongoose.connect(MONGODBURL)
.then(()=>{
    console.log('mongodb connected');
})
.catch(()=>{
    console.log('failed to connect');
})




app.listen(PORT,(req,res)=>{
    console.log(`server is running at port ${PORT}`);
 })