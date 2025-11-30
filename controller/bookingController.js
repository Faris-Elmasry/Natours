const axios = require("axios");
const Tour = require("../model/Toursmodel");
const User = require("../model/Usermodel");
const Booking = require("../model/bookingModel");
const catchAsync = require("../utilties/catchAsync");
const factory = require("./handelerFactory");
const AppError = require("../utilties/appError");

// Load Paymob credentials from environment variables
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;

// ✅ REMOVED DANGEROUS CONSOLE.LOG - Never log credentials!
// Verify credentials are loaded (only log that they exist, not their values)
if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID) {
  console.error("⚠️  Paymob credentials not found in environment variables");
}

// Helper function to get Paymob auth token
const getPaymobAuthToken = async () => {
  try {
    const authResponse = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      { api_key: PAYMOB_API_KEY }
    );
    return authResponse.data.token;
  } catch (error) {
    console.error("❌ Paymob authentication failed:", error.message);
    throw new AppError("Payment service authentication failed", 500);
  }
};

// Helper function to create Paymob order
const createPaymobOrder = async (authToken, tour) => {
  try {
    const orderResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: tour.price * 100,
        currency: "EGP",
        items: [
          {
            name: `${tour.name} Tour`,
            amount_cents: tour.price * 100,
            description: tour.summary,
            quantity: 1,
          },
        ],
      }
    );
    return orderResponse.data.id;
  } catch (error) {
    console.error("❌ Paymob order creation failed:", error.message);
    throw new AppError("Order creation failed", 500);
  }
};

// Helper function to get payment key
const getPaymentKey = async (authToken, orderId, tour, user) => {
  try {
    const paymentKeyResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: authToken,
        amount_cents: tour.price * 100,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          email: user.email,
          first_name: user.name.split(" ")[0] || "User",
          last_name: user.name.split(" ")[1] || "Name",
          phone_number: user.phone || "01000000000",
          apartment: "NA",
          floor: "NA",
          street: "NA",
          building: "NA",
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: "EG",
          state: "NA",
        },
        currency: "EGP",
        integration_id: PAYMOB_INTEGRATION_ID,
        lock_order_when_paid: false,
      }
    );
    return paymentKeyResponse.data.token;
  } catch (error) {
    console.error("❌ Payment key generation failed:", error.message);
    throw new AppError("Payment initialization failed", 500);
  }
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  // 2) Verify Paymob credentials are available
  if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID) {
    return next(new AppError("Payment service configuration error", 500));
  }

  // 3) Get authentication token
  const authToken = await getPaymobAuthToken();

  // 4) Create PayMob order
  const orderId = await createPaymobOrder(authToken, tour);

  // 5) Get payment key
  const paymentToken = await getPaymentKey(authToken, orderId, tour, req.user);

  // 6) Send PayMob iframe URL as response
  res.status(200).json({
    status: "success",
    paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/854223?payment_token=${paymentToken}`,
  });
});

// Create booking after successful payment
const createBookingCheckout = async (paymentData) => {
  try {
    // Extract tour name from payment data
    const tourName = paymentData.order.items[0]?.name?.replace(" Tour", "");
    const userEmail = paymentData.order.shipping_data?.email;

    if (!tourName || !userEmail) {
      console.error("⚠️  Missing tour name or user email in payment data");
      return;
    }

    // Find tour and user
    const tour = await Tour.findOne({ name: tourName });
    const user = await User.findOne({ email: userEmail });
    const price = paymentData.amount_cents / 100;

    if (tour && user) {
      await Booking.create({
        tour: tour.id,
        user: user.id,
        price,
      });
      console.log(`✅ Booking created for ${user.email} - ${tour.name}`);
    } else {
      console.error("⚠️  Tour or user not found:", { tourName, userEmail });
    }
  } catch (error) {
    console.error("❌ Error creating booking:", error.message);
  }
};

// Webhook handler for Paymob payment notifications
exports.webhookCheckout = async (req, res, next) => {
  try {
    const paymentData = req.body;

    // Only process successful transactions
    if (paymentData.type === "TRANSACTION" && paymentData.success === true) {
      await createBookingCheckout(paymentData);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ received: false, error: error.message });
  }
};

// CRUD operations using factory functions
exports.createBooking = factory.createone(Booking);
exports.getBooking = factory.getone(Booking);
exports.getAllBookings = factory.getall(Booking);
exports.updateBooking = factory.updateone(Booking);
exports.deleteBooking = factory.deleteone(Booking);
