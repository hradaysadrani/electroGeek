import { Request, Response, NextFunction } from "express";
export interface NewUserRequestBody{
    name: string,
    email: string,
    photo: string,
    gender: string,
    _id: string,
    dob: Date,
}

export interface NewProductRequestBody{
    name: string,
    category: string,
    price: number,
    stock: number,
    
}

export type ControllerType = (req: Request<any>, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>> | undefined>;

export type SearchRequestQuery  = {
    search?: string;
    price?: number;
    category?: string;
    sort?: string;
    page?: string;
     
}

export interface BaseQuery{
    name?: {
        $regex: string  ; // To enable search engine to show all products containing that substring.
        $options: string; // To make regex case insensitive
    };
    price?: {
        $lte: number;
    };
    category?: string ;
}

export type InvalidateCacheProps = {
    product? : boolean;
    order?: boolean;
    admin?: boolean;
    userId?: string;
    orderId?: string | string[];
    productId?: string | string[];
};

export type OrderItemType = {
    name:string;
    photo:string;
    price: number;
    quantity: number;
    productId:string;
};

export type ShippingInfoType = {
    address:string;
    city:string;
    state:string;
    country:string;
    pinCode: number;
};

export interface NewOrderRequestBody {
    shippingInfo: ShippingInfoType;
    user: string;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    orderItems: OrderItemType[];
}

interface Document {
    // Some Example properties are used.
    title: string;
    content: string;
    author: string;
    // Add other properties if needed
}

 export type OptionalDocument = Partial<Document>;