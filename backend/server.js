import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';


const PORT = 8000;
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// DB
connectDB();

// ROUTES
app.get('/', (req, res) => {
    res.send("APT WORKING");
});

app.listen(PORT, ()=>{
    console.log(`Server started on http://localhost:${PORT}`);
})

