import express from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express.Router();
// For creating new products.
app.post("/new",adminOnly,singleUpload,newProduct);

// For 5 latest products
app.get("/latest", getLatestProducts);

// For all products
app.get("/all", getAllProducts);


// For getting unique categories
app.get("/categories", getAllCategories);

// for getting list of all products
app.get("/admin-products",adminOnly ,getAdminProducts);

app.route("/:id").get(getSingleProduct).put(adminOnly,singleUpload,updateProduct).delete(adminOnly, deleteProduct);  

export default app;