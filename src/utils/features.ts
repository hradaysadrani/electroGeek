import mongoose from "mongoose";
import { InvalidateCacheProps, OptionalDocument, OrderItemType } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
import { Order } from "../models/order.js";
export const connectDB = (uri : string) => {

    mongoose.connect(uri, {dbName: "electroGeek",})
    .then(
        (c) => console.log(`DB successfully connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
}

export const invalidateCache = ({product, order, admin,userId, orderId, productId,} : InvalidateCacheProps) => { // /* Without desctructuring ->*/ props : InvalidateCacheProps // removed async as it was not needed
    if(product){
        const productKeys: string[] = [
            "latest-products",
            "categories",
            "all-products",
        ];
        if(typeof productId ==="string") {
            productKeys.push(`product-${productId}`);
            console.log("Working..");
        }

        if(typeof productId ==="object") {
            productId.forEach((i) => productKeys.push(`product-${i}`));
            console.log("Working..");
        }
        // const products = await Product.find({}).select("_id"); // As we have opted for productId approach.

        // products.forEach((i) => {
        //     productKeys.push(`products-${i._id}`);
        // });

        myCache.del(productKeys);
    }
    if(order){
        const ordersKeys:string[] = ["all-orders",`my-orders-${userId}`,`order-${orderId}`];
        // const orders = await Order.find({}).select("_id");

        // orders.forEach((i) => {
        //     orders.forEach((i) => {
        //         ordersKeys.push();
        //     });
        // })
        myCache.del(ordersKeys);
    }
    if(admin){
        myCache.del(["admin-stats","admin-pie-charts","admin-bar-charts","admin-line-charts"])
    }
    
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
for(let i = 0 ; i < orderItems.length ; i++){
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if(!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
}
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    if(lastMonth === 0){
        return thisMonth*100;
    }
    const percent = (thisMonth / lastMonth)* 100;
    return Number(percent.toFixed(0));
}

export const getInventories  =  async ({ categories, productsCount} : {categories : string[]; productsCount : number;}) => {

        const categoriesCount = await Promise.all(categories.map((category) => Product.countDocuments({ category})));
        
        const categoryCount: Record<string, number>[] = [];

        categories.forEach((category, i) => {
            categoryCount.push({
                [category]: Math.round((categoriesCount[i]/ productsCount)*100),  // category is wiritten inside [] just to make compiler aware that it is an variable, not a string
            });
        })

        return categoryCount;
};

interface MyDocument extends OptionalDocument {
    createdAt: Date;
    discount?: number;
    total?:number;
}

type FuncProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;  
    property?: "discount" | "total";  
}

export const getChartData = ({ length, docArr, today, property }: FuncProps) => {
    const data:number[] = new Array(length).fill(0);
    // const today = new Date();

        docArr.forEach((i) => {
            const creationDate = i.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12)%12;

            if(monthDiff < length){
                data[length-monthDiff-1] += property? i[property]! : 1 ;
            }
        });

    return data;    
};