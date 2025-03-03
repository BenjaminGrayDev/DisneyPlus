import { PAYPAL_API } from "../../../global/urls.js";
import { getAccessToken } from "../Authentication.js";

export const createProduct = async() => {

    try{

        const accessToken = await getAccessToken();

        const productPayload = {
            "name" : "Disney Plus",
            "description" : "A platform for SEO analysis, keyword research, competitive analysis, and backlink monitoring. Includes multiple subscription tiers with various features.",
            "type" : "SERVICE",
            "category" : "SOFTWARE",
            "image_url" : "https://disneyplus.com/logo.png",
            "home_url": "https://disneyplus.com"
        }

        const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
            method : "POST",
            headers : {
                'Authorization' : `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'PayPal-Request-Id': `PRODUCT-${Date.now()}`,
                'Prefer': 'return=representation'
            },
            body : JSON.stringify(productPayload)
        })

        if(!response.ok){
            throw new Error(`Failed to create product: ${response.statusText}`);
        }

        const responseJSON = await response.json();

        return responseJSON;

    }catch(error){
        throw new ErrorHandler(error.message, 500);
    }
}