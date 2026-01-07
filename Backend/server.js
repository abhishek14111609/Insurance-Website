import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import DemoRoutes from './routes/demo.route.js';

const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.use("/api/msg",DemoRoutes)

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
});