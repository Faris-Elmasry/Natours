import axios from 'axios';
import { showAlert } from './alerts';

/**
 * Fetch user's reviews
 */
export const getMyReviews = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/reviews',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      return res.data.data.reviews || [];
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
    if (err.response && err.response.data && err.response.data.message) {
      showAlert('error', err.response.data.message);
    }
    return [];
  }
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, rating, review) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/reviews/${reviewId}`,
      data: { rating, review },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review updated successfully!');
      return res.data.data.review;
    }
  } catch (err) {
    console.error('Error updating review:', err);
    if (err.response && err.response.data && err.response.data.message) {
      showAlert('error', err.response.data.message);
    }
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`,
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review deleted successfully!');
      return true;
    }
  } catch (err) {
    console.error('Error deleting review:', err);
    if (err.response && err.response.data && err.response.data.message) {
      showAlert('error', err.response.data.message);
    }
    return false;
  }
};

/**
 * Render reviews section with review cards
 */
export const renderReviews = (reviews, container) => {
  if (!container) return;

  if (!reviews || reviews.length === 0) {
    container.innerHTML =
      '<p>You have no reviews yet. Book a tour and share your experience!</p>';
    return;
  }

  let html = '<div class="reviews__list">';
  reviews.forEach((rev) => {
    const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
    html += `
      <div class="review-card">
        <div class="review-card__header">
          <h4 class="heading-tertiary">${rev.tour.name}</h4>
          <p class="review-card__rating">${stars} (${rev.rating}/5)</p>
        </div>
        <p class="review-card__content">${rev.review}</p>
        <p class="review-card__date">Reviewed on ${new Date(
          rev.createdAt
        ).toLocaleDateString()}</p>
        <div class="review-card__actions">
          <button class="btn btn--small btn--edit-review" data-review-id="${
            rev._id
          }">Edit</button>
          <button class="btn btn--small btn--delete-review" data-review-id="${
            rev._id
          }">Delete</button>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;

  // Attach event listeners for edit/delete buttons
  container.querySelectorAll('.btn--edit-review').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const reviewId = e.target.dataset.reviewId;
      // TODO: Open edit modal/form
      console.log('Edit review:', reviewId);
    });
  });

  container.querySelectorAll('.btn--delete-review').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const reviewId = e.target.dataset.reviewId;
      if (confirm('Are you sure you want to delete this review?')) {
        const deleted = await deleteReview(reviewId);
        if (deleted) {
          // Refresh the reviews list
          location.reload();
        }
      }
    });
  });
};
