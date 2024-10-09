import express from 'express';
import dotenv from 'dotenv';

import cors from 'cors'

import userRoutes from "./routes/usersRoutes.js";
import productsRoutes from './routes/productsRoutes.js';
import invoicesRoutes from './routes/invoicesRoutes.js';

import conectarDB from './config/db.js';


const app = express();

app.use(cors({
   origin: 'http://127.0.0.1:5173',
   methods: ['GET', 'POST'],
   allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

dotenv.config();

 conectarDB();

const PORT = process.env.PORT || 1308;

//  Routes

app.use("/api/users", userRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/invoices", invoicesRoutes);

app.listen(PORT, () => {
   console.log(`Servidor conenctado en el puerto ${PORT}`);
})