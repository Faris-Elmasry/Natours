import axios from 'axios';
import { showAlert } from './alerts';

/**
 * Fetch user's bookings
 */
export const getMyBookings = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/bookings',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      return res.data.data.bookings || [];
    }
  } catch (err) {
    console.error('Error fetching bookings:', err);
    if (err.response && err.response.data && err.response.data.message) {
      showAlert('error', err.response.data.message);
    }
    return [];
  }
};

/**
 * Render bookings section with booking details
 */
export const renderBookings = (bookings, container) => {
  if (!container) return;

  if (!bookings || bookings.length === 0) {
    container.innerHTML = '<p>You have no bookings yet.</p>';
    return;
  }

  let html = '<div class="bookings__list">';
  bookings.forEach((booking) => {
    html += `
      <div class="booking-card">
        <div class="booking-card__content">
          <h4 class="heading-tertiary">${booking.tour.name}</h4>
          <p class="booking-card__info">
            <strong>Price:</strong> EGP ${booking.price}
          </p>
          <p class="booking-card__info">
            <strong>Booked on:</strong> ${new Date(
              booking.createdAt
            ).toLocaleDateString()}
          </p>
          <p class="booking-card__info">
            <strong>Tour Date:</strong> ${new Date(
              booking.tour.startDates[0]
            ).toLocaleDateString()}
          </p>
          <a href="/tour/${
            booking.tour.slug
          }" class="btn btn--small">View Tour</a>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
};
