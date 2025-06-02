import cloudinary from 'cloudinary';
import fs from 'fs';
import https from 'https';
import Razorpay from 'razorpay';
import app from './app.js';
const PORT = process.env.PORT;

// configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// configure Razorpay
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

// create an HTTPS server using Let's Encrypt certificates

const privateKey = fs.readFileSync('/etc/letsencrypt/live/api.codeacademy.vishalamin.site/privkey.pem', 'utf-8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/api.codeacademy.vishalamin.site/fullchain.pem', 'utf-8');

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
    console.log(`Server is running at https://api.codeacademy.vishalamin.site:${PORT}`);
});
