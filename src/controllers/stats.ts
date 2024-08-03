import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getChartData, getInventories } from "../utils/features.js";
import { allOrders } from "./order.js";

export const getDashboardStats = TryCatch(async (req,res,next) => {
    let stats = {};
    const today = new Date();

    const key = "admin-stats";
    if(myCache.has(key)){
        stats = JSON.parse(myCache.get(key) as string);
    }
    else{
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);


        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }

        const thisMonthProductsPromise = await Product.find({
            createdAt:{
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        });

        const lastMonthProductsPromise = await Product.find({
            createdAt:{
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        });

        const thisMonthUsersPromise = await User.find({
            createdAt:{
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        });

        const lastMonthUsersPromise = await User.find({
            createdAt:{
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        });

        const thisMonthOrderPromise = await Order.find({
            createdAt:{
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        });

        const lastMonthOrderPromise = await Order.find({
            createdAt:{
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        });

        const lastSixMonthOrdersPromise = await Order.find({
            createdAt:{
                $gte: sixMonthsAgo,
                $lte: today,
            }
        });
        
        const latestTransactionPromise = Order.find({}).select(["orderItems","discount","total","status"]).limit(4); // make sure orderItems match with DB's orders list.

        const [thisMonthProducts, thisMonthUsers, thisMonthOrders, lastMonthProducts, lastMonthUsers, lastMonthOrders, lastSixMonthOrders,productsCount, usersCount,allOrders, categories, femaleUsersCount, latestTransaction] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrderPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrderPromise,
            lastSixMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            Product.distinct("category"),
            User.countDocuments({gender: "female"}),
            latestTransactionPromise,
        ])

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);

        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue,lastMonthRevenue),

            product : calculatePercentage(
                thisMonthProducts.length, lastMonthProducts.length
            ),
            user: calculatePercentage(
                thisMonthUsers.length, lastMonthUsers.length
            ),
            order: calculatePercentage(
                thisMonthOrders.length, lastMonthOrders.length
            ),
        }
        const revenue = allOrders.reduce((total, orders) => total + (orders.total || 0), 0);

        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length,
        };

        const orderMonthCounts = getChartData({length: 6, today, docArr: lastSixMonthOrders});

        const orderMonthlyRevenue = getChartData({length: 6, today, docArr: lastSixMonthOrders, property: "total"})

        // const orderMonthCounts = new Array(6).fill(0);
        // const orderMonthlyRevenue = new Array(6).fill(0);
        // lastSixMonthOrders.forEach((order) => { // This one has better time complexity
        //     const creationDate = order.createdAt;
        //     const monthDiff = (today.getMonth() - creationDate.getMonth() + 12)%12;

        //     if(monthDiff < 6){
        //         orderMonthCounts[6-monthDiff-1] += 1;
        //         orderMonthlyRevenue[6-monthDiff-1] += order.total;
        //     }
        // })
        
        const categoryCount = await getInventories({categories, productsCount}); // No need to write : Record<string, number>[] as it will return this type of data only!

        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount,
        };

        const modifiedLatestTransaction = latestTransaction.map(i => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status,
        }));

        stats = {
            userRatio,
            latestTransaction: modifiedLatestTransaction,
            categoryCount,
            changePercent,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            }
        };

        myCache.set(key, JSON.stringify(stats));
    }

    return res.status(200).json({
        success: true,
        stats,
    })
});

export const getPieCharts = TryCatch(async (req,res,next) => {
    let charts;

    const key = "admin-pie-charts"
    if(myCache.has(key)){
        charts = JSON.parse(myCache.get(key) as string);
    }
    else{
        const allOrderPromise = Order.find({}).select(["total","discount","subtotal","tax","shippingCharges"]) // should match with what present in Order schema

        const [processingOrder, shippedOrder, deliveredOrder, categories, productsCount, outOfStock, allOrders, allUsers, adminUsers, customerUsers] = await Promise.all([
            Order.countDocuments({ status: "Processing"}),
            Order.countDocuments({ status: "Shipped"}),
            Order.countDocuments({ status: "Delivered"}),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock:0}),
            allOrderPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin"}),
            User.countDocuments({ role: "user"}),
        ]);

        const orderFulfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder
        };

        const stockAvailability = {
            inStock: productsCount - outOfStock,
            outStock: outOfStock

        };

        const grossIncome = allOrders.reduce((prev,order) => prev + ((order.total*0.2) || 0),0);

        const discount = allOrders.reduce((prev,order) => prev + (order.discount || 0),0);
        
        const productionCost = allOrders.reduce((prev,order) => prev + (order.shippingCharges + (order.tax/10) || 0),0);  // Self modified value

        const burnt = allOrders.reduce((prev,order) => prev + ((order.tax/2) || 0),0);

        const marketingCost = Math.round(grossIncome*(20/100));

        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,

        };

        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age <= 50).length,
            senior: allUsers.filter((i) => i.age > 50).length
        }

        const productCategories = await getInventories({categories, productsCount}); // No need to write : Record<string, number>[] as it will return this type of data only!

        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        }

        charts = {
            adminCustomer,
            orderFulfillment,
            productCategories, 
            stockAvailability,
            revenueDistribution,
            usersAgeGroup
        };

        myCache.set(key, JSON.stringify(charts));

    }
    return res.status(200).json({
        success: true,
        charts,
    })
});

export const getBarCharts = TryCatch(async (req,res,next) => {
    let charts;

    const key = "admin-bar-charts";

    if(myCache.has(key)){
        charts = JSON.parse(myCache.get(key) as string);
    }
    else{
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const sixMonthProductPromise = await Product.find({
            createdAt:{
                $gte: sixMonthsAgo,
                 $lte: today,
            }
        }).select("createdAt");
        const sixMonthUsersPromise = await User.find({
            createdAt:{
                $gte: sixMonthsAgo,
                $lte: today,
            }
        }).select("createdAt");
        const twelveMonthOrdersPromise = await Order.find({
            createdAt:{
                $gte: twelveMonthsAgo,
                $lte: today,
            }
        }).select("createdAt");

        const [products, users, orders] = await Promise.all([sixMonthProductPromise, sixMonthUsersPromise, twelveMonthOrdersPromise]);

        const productCounts = getChartData({length: 6, today, docArr: products})
        const usersCounts = getChartData({length: 6, today, docArr: users})
        const orderCounts = getChartData({length: 12, today, docArr: orders})
        charts = {
            users: usersCounts,
            products: productCounts,
            orders: orderCounts
        };

        myCache.set(key,JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    })
});

export const getLineCharts = TryCatch(async (req,res,next) => {
    let charts;

    const key = "admin-line-charts";

    if(myCache.has(key)){
        charts = JSON.parse(myCache.get(key) as string);
    }
    else{
        const today = new Date();

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const baseQuery = {createdAt:{
            $gte: twelveMonthsAgo,
            $lte: today,
        }}

        const [products, users, orders] = await Promise.all([
             Product.find(baseQuery).select("createdAt"),
             User.find(baseQuery).select("createdAt"),
             Order.find(baseQuery).select(["createdAt","discount", "total"])]);

        const productCounts = getChartData({length: 12, today, docArr: products})
        const usersCounts = getChartData({length: 12, today, docArr: users})
        const discount = getChartData({length: 12, today, docArr: orders, property: "discount"})
        const revenue = getChartData({length: 12, today, docArr: orders, property: "total"})
        
        charts = {
            users: usersCounts,
            products: productCounts,
            discount,
            revenue
        };

        myCache.set(key,JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    })
});