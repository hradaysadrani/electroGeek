import express from "express";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
// Importing Routes.
import userRoute from './routes/user.js';
import productRoute from './routes/product.js';
import orderRoute from './routes/order.js';
import paymentRoute from './routes/payment.js';
import dashboardRoute from './routes/stats.js';

import { connectDB } from './utils/features.js';
import { errorMiddleware } from "./middlewares/error.js";
import Stripe from "stripe";
import cors from "cors";

config({
    path:"./.env",
});

const port =  process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";
connectDB(mongoURI);
const app = express();

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors()); 
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    next();
  });// we can specify choices where it should be allowed  
// app.use(express.urlencoded());only to bes used if postman is sending data in urlencoded mode.

// Using Routes
app.get("/", (req,res) => {
    res.send("Your backend is working like a charm!");
})

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads",express.static("uploads")); // this will allow external user to access the files through browser.

app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Application Server is running on http://localhost:${port}`);
})