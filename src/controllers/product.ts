import { NextFunction, Response, Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { stringify } from "querystring";
import { invalidateCache } from "../utils/features.js";

function isStringOrStringArray(value: any): value is string {
    return typeof value === 'string' || (Array.isArray(value) && value.every(item => typeof item === 'string'));
}

// Revalidate on New,Update,Delete
export const getLatestProducts = TryCatch(async(req: Request<{},{},NewProductRequestBody>,res: Response,next: NextFunction) => {
    let products;
    
    if(myCache.has("latest-products"))
        products = JSON.parse(myCache.get("latest-products") as string);
    else{
    products = await Product.find({}).sort({ createdAt: -1}).limit(5);
    myCache.set("latest-products",JSON.stringify(products));
}
    return res.status(200).json({
       success: true,
       products
    }); 
});


// Revalidate on New, Update, Delete Product & on New Order.
export const getAllCategories = TryCatch(async(req: Request<{},{},NewProductRequestBody>,res: Response,next: NextFunction) => {
    let categories;

    if(myCache.has("categories")) {
        categories = JSON.parse(myCache.get("categories") as string);
    }
    else{
        categories = await Product.distinct("category");
        myCache.set("categories", JSON.stringify(categories));
    }
    

    return res.status(200).json({
       success: true,
       categories,
    }); 
});

// Revalidate on New, Update, Delete Product & on new order.    
export const getAdminProducts = TryCatch(async(req,res, next) => {
    let products;

    // if(myCache.has("all-products")){
    //     products = JSON.parse(myCache.get("all-products") as string);
    // }
    // else{
        products = await Product.find({});
        // myCache.set("all-products",JSON.stringify("all-products"));

    // }
    

    return res.status(200).json({
       success: true,
       products: products,
    }); 
});

export const getSingleProduct = TryCatch(async(req,res,next) => {
    let product;
    const id = req.params.id;

    if(myCache.has(`product-${id}`)){
        product = JSON.parse(myCache.get(`product-${id}`) as string);
    }
    else{
        product = await Product.findById(id);
        if(!product){
            return next(new ErrorHandler("Product Not Found!",404));
        }
        myCache.set(`product-${id}`,JSON.stringify(`product-${id}`));

    }
    
    product = await Product.findById(id);

    return res.status(200).json({
       success: true,
       product,
    }); 
});

export const newProduct = TryCatch(async(req: Request<{},{},NewProductRequestBody>,res: Response,next: NextFunction) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if(!photo) return next(new ErrorHandler("Please add Photo",400));
    
    if(!name || !price || !stock || !category ) 
       {
           rm(photo.path, () => {
               console.log("Deleted");
           })
           
           return next(new ErrorHandler("Please enter all neccessary details!",400));
       }
       await Product.create({
       name, 
       price,
       stock,
       category: category.toLowerCase(),
       photo: photo?.path,
    });

    invalidateCache({ product: true, admin: true});

    return res.status(201).json({
       success: true,
       message: "Product Created Successfully"
    }); 
});


export const updateProduct = TryCatch(async(
    req: Request<{id: string},{},NewProductRequestBody>,res: Response,next: NextFunction
    ) => {
        const {id} = req.params;
        const { name, price, stock, category} = req.body;
    const photo = req.file;
    const product = await Product.findById(id);

    if(!product) return next(new ErrorHandler("Product Not Found!",404));
    // if(!photo) return next(new ErrorHandler("Please add Photo",400));
    
    if(photo) 
       {
           rm(product.photo!, () => {
               console.log("Old photo was successfully deleted!");
           });
           product.photo = photo.path;
       }
    if(name)
        product.name = name;
    if(price)
        product.price = price;
    if(category)
        product.category = category;
    if(stock)
        product.stock = stock;

    await product.save();
    invalidateCache({ product: true, productId: String(product._id), admin: true});

    return res.status(200).json({
       success: true,
       message: `Product Updated Successfully!`, // , new product details are ${product}
    }); 
});

export const deleteProduct = TryCatch(async(req,res,next) => {
    const product = await Product.findById(req.params.id);
    // const photo = req.file;

    if(!product) return next(new ErrorHandler("Product Not Found!",404));
        
        rm(product.photo, () => {
            console.log("Old photo was successfully deleted!");
        });
            // product.photo = photo.path;


    await product.deleteOne();
    invalidateCache({ product: true, productId: String(product._id), admin: true  });
    
    return res.status(200).json({
       success: true,
       message: `Product has been deleted successfully. These were the product details: ${product}`,
    }); 
});

export const getAllProducts = TryCatch(
    async(req: Request<{},{},SearchRequestQuery>,res: Response,next: NextFunction) => {
        const { search, sort, category, price} = req.query;

        const page = Number(req.query.page) || 1;

        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = limit*(page - 1);
        
        const baseQuery:BaseQuery = {};
        // price: {
        //     $lte: Number(price), // Less than or equal to
        // },
        // category

        if (typeof search === 'string' || Array.isArray(search)) {
            baseQuery.name = {
                $regex: Array.isArray(search) ? search.join('|') : search, // Handle string[] by joining with '|'
                $options: "i", // To make regex case insensitive
            };
        }

        if(price)
            baseQuery.price = {
                $lte: Number(price),
            };

        if(isStringOrStringArray(category))
            baseQuery.category! =  category;
        
        const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc"? 1: -1})
        .limit(limit).skip(skip);

        const [products, filteredOnlyProduct] = await Promise.all([
                productsPromise,
                Product.find(baseQuery),
            ]);
        
        const totalPage = Math.ceil(filteredOnlyProduct.    length/limit);

    return res.status(200).json({
       success: true,
       products,
       totalPage,
    }); 
});
