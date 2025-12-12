// paymob.js - Secure payment integration
import axios from 'axios';
import { showAlert } from './alerts';

console.log('Paymob payment module loaded');

/**
 * Book a tour and redirect to Paymob payment
 * All sensitive credentials are handled server-side
 */
export const bookTour = async (tourId) => {
  try {
    if (!tourId) {
      showAlert('error', 'Invalid tour ID');
      return;
    }

    console.log('Initiating payment for tour:', tourId);

    // 1) Get checkout session from API (server handles Paymob auth)
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
      withCredentials: true, // Include JWT token in cookie
    });

    if (session.data.status === 'success' && session.data.paymentUrl) {
      console.log('Payment session created successfully');
      // 2) Redirect to Paymob payment iframe
      window.location.assign(session.data.paymentUrl);
    } else {
      showAlert('error', 'Failed to create payment session');
    }
  } catch (err) {
    console.error('Payment error:', err);
    if (err.response && err.response.data && err.response.data.message) {
      showAlert('error', err.response.data.message);
    } else {
      showAlert('error', 'Payment initialization failed. Please try again.');
    }
  }
};
