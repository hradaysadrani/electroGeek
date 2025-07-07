import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.js";
import { multerUpload } from "../utils/features.js";

const app = express.Router();

// For 5 latest products
app.get("/latest", getLatestProducts);

// For all products
app.get("/all", getAllProducts);

// For getting unique categories
app.get("/categories", getAllCategories);

// for getting list of all products
app.get("/admin-products",adminOnly ,getAdminProducts);

// For creating new products.
app.post("/new",adminOnly,multerUpload.single("photo"),newProduct);

app.route("/:id").get(getSingleProduct).put(adminOnly,multerUpload.single("photo"),updateProduct).delete(adminOnly, deleteProduct);  

export default app;