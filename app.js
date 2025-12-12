const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cookieParser = require("cookie-parser");
const AppError = require("./utilties/appError");
const GloabalErrorhandler = require("./controller/errorHandler");
const cors = require("cors");

const toursRouter = require("./routes/toursRouter");
const usersRouter = require("./routes/usersRouter");
const reviewRouter = require("./routes/reviewRouter");
const viewRouter = require("./routes/viewRouter");

const bookingRouter = require("./routes/bookingRoutes");
const bookingController = require("./controller/bookingController");

const exp = require("constants");

const app = express();

// Trust proxy for ngrok and other proxies
app.set("trust proxy", 1);

// // Allow all origins (for development purposes only)
// app.use(cors());

// // Alternatively, allow only specific origins
// app.use(
//   cors({
//     origin: "http://localhost:3000", // Adjust to your front-end address
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
//  Global middleware

// serving static files // Any files within that directory will be accessible to clients making requests to the Express.js server.
app.use(express.static(path.join(__dirname, "starter/public")));

// Handle favicon request
app.get("/favicon.ico", (req, res) => {
  res.status(204).send(); // No Content - suppress 404
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(204).send(); // No Content
});

//Use helmet to protect HTTP Header with CSP configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://unpkg.com",
        "https://api.mapbox.com",
        "https://js.stripe.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://unpkg.com",
        "https://fonts.googleapis.com",
        "https://api.mapbox.com",
      ],
      connectSrc: [
        "'self'",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://unpkg.com",
        "https://tile.openstreetmap.org",
        "https://{s}.tile.openstreetmap.org",
        "https://*.tiles.mapbox.com",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        "https://accept.paymob.com",
        "ws://localhost:*",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://tile.openstreetmap.org",
        "https://*.tiles.mapbox.com",
        "https://api.mapbox.com",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    },
  })
);

//Development and production
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else if (process.env.NODE_ENV === "production") {
  // Code to run in production mode
  console.log("Running in production mode");
}

//limiting
const Limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this ip please try again after 1 hr ",
});

app.use("/api", Limiter);

//Body parser ,reading data from body into req .body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
//Data sanitization aggainst NOSQL -query injection
app.use(mongoSanitize());

//Data sanitization aggainst cross site scriptitg attacks
app.use(xss());

//protect parmerter polloution
app.use(
  hpp({
    whitelist: [
      "duration",
      "difficulty",
      "maxGroupSize",
      "price",
      "priceDiscount",
      "ratingsAverage",
      "ratingsQuantity",
      "pricediscount",
    ],
  })
);

//test middleware
app.use((req, res, next) => {
  // console.log("hello from middleware");
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

//Routes

// api routes pug templetes

// Add this middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`  from app js  ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/bundle.js.map", (req, res) => {
  res.sendFile(path.join(__dirname, "starter/public/js/bundle.js.map"));
});

app.use("/", viewRouter);
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);
//using multiple router mounting
//routes in rotes file
//functions in controller

//handeled the weird url

app.all("*", (req, res, next) => {
  next(
    new AppError(`canot find this url ${req.originalUrl} on this server`, 404)
  );
});

app.use(GloabalErrorhandler);

module.exports = app;
