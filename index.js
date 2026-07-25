require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');
const cors = require('cors');

const staticRoute = require('./routes/static.route')
const userRoute = require('./routes/user')
const productroute = require('./routes/product.route')
const categoryRoute = require('./routes/category.route')
const collectionRoute = require('./routes/collection.route')
const metalRoute = require('./routes/metalrates.route')
const cartRoute = require('./routes/cart.route')
const paymentRoutes = require("./routes/payment.route");
const orderRoutes = require("./routes/order.route");

const path = require('path');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');


connectDB()

const app = express();


// Setting EJS
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static("public"));


    
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://www.miashka.com"
    ],
    credentials: true
}));

app.use("/payment/webhook",
    express.raw({ type: "application/json" })
);
app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(methodOverride('_method'));

app.use('/product', productroute);
app.use('/category', categoryRoute);
app.use('/collection', collectionRoute);
app.use('/metal', metalRoute);
app.use('/cart', cartRoute)
app.use('/user', userRoute);
app.use("/payment", paymentRoutes);

app.use("/order", orderRoutes);
app.use('/', staticRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
