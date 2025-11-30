// paymob.js
import axios from 'axios';
import { showAlert } from './alerts';
console.log("form paymob")
export const bookTour = async tourId => {
  try {
    console.log("form paymob")
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    
    // 2) Redirect to PayMob iframe URL
    window.location.assign(session.data.paymentUrl);
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};