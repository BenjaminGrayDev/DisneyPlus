import { PAYPAL_API } from "../../global/urls.js";

export const getAccessToken = async() => {

    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AYKQNl-9xuQyE4xvLT4jd7nZ1DUpp6C2IhJUXL1Q0NFRMbvynQBqEvaZnfetPHxl868jb3DRCuZAAueB';
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EKFaeiRfba_9HZiLehFqJVE4TDC3opUV0EukePDXcjw9WTylqGeTU0EVTAQjrKDGxZAcVDIJ6C6ByHzl';

    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');

    try{

        const authorization = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

        console.log(CLIENT_ID, CLIENT_SECRET)

        const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method : 'POST',
            headers : {
                'Authorization' : `Basic ${authorization}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body : formData.toString()
        })

        if(!response.ok){
            throw new Error(`Failed to get access token: ${response.statusText}`);
        }

        const responseJSON = await response.json();

        return responseJSON.access_token;

    }catch(error){
        throw new Error(error.message);
    }
}