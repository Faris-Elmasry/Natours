import axios from 'axios';
import { showAlert } from './alerts';

// ========== GLOBAL STATE FOR CLIENT-SIDE FILTERING ==========
let allTours = [];
let allUsers = [];
let allReviews = [];
let allBookings = [];

/**
 * Fetch all tours (no server-side filtering)
 */
export const getAdminTours = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/tours?limit=1000',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      allTours = res.data.data || [];
      return allTours;
    }
  } catch (err) {
    console.error('Error fetching tours:', err);
    if (err.response?.data?.message) {
      showAlert('error', err.response.data.message);
    }
    return [];
  }
};

/**
 * Fetch all users (no server-side filtering)
 */
export const getAdminUsers = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users?limit=1000',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      allUsers = res.data.data || [];
      return allUsers;
    }
  } catch (err) {
    console.error('Error fetching users:', err);
    if (err.response?.data?.message) {
      showAlert('error', err.response.data.message);
    }
    return [];
  }
};

/**
 * Fetch all reviews (no server-side filtering)
 */
export const getAdminReviews = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/reviews?limit=1000',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      allReviews = res.data.data || [];
      return allReviews;
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
    if (err.response?.data?.message) {
      showAlert('error', err.response.data.message);
    }
    return [];
  }
};

/**
 * Fetch all bookings (no server-side filtering)
 */
export const getAdminBookings = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/bookings?limit=1000',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      allBookings = res.data.data || [];
      return allBookings;
    }
  } catch (err) {
    console.error('Error fetching bookings:', err);
    if (err.response?.data?.message) {
      showAlert('error', err.response.data.message);
    }
    return [];
  }
};

// ========== DELETE FUNCTIONS ==========
export const deleteTour = async (tourId) => {
  try {
    await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`,
      withCredentials: true,
    });
    showAlert('success', 'Tour deleted successfully!');
    allTours = allTours.filter((t) => t._id !== tourId);
    return true;
  } catch (err) {
    console.error('Error deleting tour:', err);
    showAlert('error', err.response?.data?.message || 'Error deleting tour');
    return false;
  }
};

export const deleteUser = async (userId) => {
  try {
    await axios({
      method: 'DELETE',
      url: `/api/v1/users/${userId}`,
      withCredentials: true,
    });
    showAlert('success', 'User deleted successfully!');
    allUsers = allUsers.filter((u) => u._id !== userId);
    return true;
  } catch (err) {
    console.error('Error deleting user:', err);
    showAlert('error', err.response?.data?.message || 'Error deleting user');
    return false;
  }
};

export const deleteAdminReview = async (reviewId) => {
  try {
    await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`,
      withCredentials: true,
    });
    showAlert('success', 'Review deleted successfully!');
    allReviews = allReviews.filter((r) => r._id !== reviewId);
    return true;
  } catch (err) {
    console.error('Error deleting review:', err);
    showAlert('error', err.response?.data?.message || 'Error deleting review');
    return false;
  }
};

export const deleteBooking = async (bookingId) => {
  try {
    await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${bookingId}`,
      withCredentials: true,
    });
    showAlert('success', 'Booking deleted successfully!');
    allBookings = allBookings.filter((b) => b._id !== bookingId);
    return true;
  } catch (err) {
    console.error('Error deleting booking:', err);
    showAlert('error', err.response?.data?.message || 'Error deleting booking');
    return false;
  }
};

// ========== CLIENT-SIDE FILTER & PAGINATE HELPERS ==========
const filterData = (data, searchTerm, searchFields) => {
  if (!searchTerm) return data;
  const term = searchTerm.toLowerCase();
  return data.filter((item) =>
    searchFields.some((field) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value?.toString().toLowerCase().includes(term);
    })
  );
};

const paginateData = (data, page, limit) => {
  const start = (page - 1) * limit;
  return data.slice(start, start + limit);
};

const sortData = (data, sortBy) => {
  if (!sortBy) return data;
  const isDesc = sortBy.startsWith('-');
  const field = isDesc ? sortBy.slice(1) : sortBy;

  return [...data].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return isDesc ? 1 : -1;
    if (valA > valB) return isDesc ? -1 : 1;
    return 0;
  });
};

// ========== RENDER ADMIN TOURS ==========
export const renderAdminTours = (container) => {
  if (!container) return;

  let currentPage = 1;
  let currentLimit = 10;
  let currentSearch = '';
  let currentSort = '-createdAt';

  const render = () => {
    let filtered = filterData(allTours, currentSearch, ['name']);
    filtered = sortData(filtered, currentSort);
    const total = filtered.length;
    const totalPages = Math.ceil(total / currentLimit);
    const paginated = paginateData(filtered, currentPage, currentLimit);

    let html = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg class="admin-panel__icon"><use xlink:href="/img/icons.svg#icon-map"></use></svg>
            Tours Management
          </h3>
          <div class="admin-panel__header-actions" style="display: flex; align-items: center; gap: 1rem;">
             <a href="/create-tour" class="btn btn--small btn--green">Create New Tour</a>
             <span class="admin-panel__count">${total} tours</span>
          </div>
        </div>
        
        <div class="admin-panel__controls">
          <div class="admin-panel__search">
            <svg class="admin-panel__search-icon"><use xlink:href="/img/icons.svg#icon-search"></use></svg>
            <input type="text" id="tour-search" class="admin-panel__input" placeholder="Search tours..." value="${currentSearch}">
          </div>
          <select id="tour-sort" class="admin-panel__select">
            <option value="-createdAt" ${
              currentSort === '-createdAt' ? 'selected' : ''
            }>Newest</option>
            <option value="createdAt" ${
              currentSort === 'createdAt' ? 'selected' : ''
            }>Oldest</option>
            <option value="price" ${
              currentSort === 'price' ? 'selected' : ''
            }>Price ↑</option>
            <option value="-price" ${
              currentSort === '-price' ? 'selected' : ''
            }>Price ↓</option>
            <option value="name" ${
              currentSort === 'name' ? 'selected' : ''
            }>Name A-Z</option>
            <option value="-ratingsAverage" ${
              currentSort === '-ratingsAverage' ? 'selected' : ''
            }>Top Rated</option>
          </select>
          <select id="tour-limit" class="admin-panel__select">
            <option value="10" ${
              currentLimit === 10 ? 'selected' : ''
            }>10</option>
            <option value="25" ${
              currentLimit === 25 ? 'selected' : ''
            }>25</option>
            <option value="50" ${
              currentLimit === 50 ? 'selected' : ''
            }>50</option>
          </select>
        </div>

        <div class="admin-panel__table-wrap">
          ${
            paginated.length === 0
              ? `
            <div class="admin-panel__empty">
              <svg class="admin-panel__empty-icon"><use xlink:href="/img/icons.svg#icon-map"></use></svg>
              <p>No tours found</p>
            </div>
          `
              : `
            <table class="admin-panel__table">
              <thead>
                <tr>
                  <th>Tour Name</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${paginated
                  .map(
                    (tour) => `
                  <tr>
                    <td>
                      <div class="admin-panel__tour-name">
                        <img src="/img/tours/${tour.imageCover}" alt="${
                      tour.name
                    }" class="admin-panel__tour-img">
                        <span>${tour.name}</span>
                      </div>
                    </td>
                    <td><span class="admin-panel__price">EGP ${
                      tour.price
                    }</span></td>
                    <td>${tour.duration} days</td>
                    <td>
                      <span class="admin-panel__rating">
                        <svg class="admin-panel__star"><use xlink:href="/img/icons.svg#icon-star"></use></svg>
                        ${tour.ratingsAverage?.toFixed(1) || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div class="admin-panel__actions">
                        <a href="/tour/${
                          tour.slug
                        }" class="admin-panel__btn admin-panel__btn--view" title="View">
                          <svg><use xlink:href="/img/icons.svg#icon-eye"></use></svg>
                        </a>
                        <a href="/edit-tour/${
                          tour._id
                        }" class="admin-panel__btn admin-panel__btn--edit" title="Edit">
                          <svg><use xlink:href="/img/icons.svg#icon-edit"></use></svg>
                        </a>
                        <button class="admin-panel__btn admin-panel__btn--delete" data-id="${
                          tour._id
                        }" title="Delete">
                          <svg><use xlink:href="/img/icons.svg#icon-trash"></use></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
          }
        </div>

        ${
          totalPages > 1
            ? `
          <div class="admin-panel__pagination">
            <button class="admin-panel__page-btn" data-page="${
              currentPage - 1
            }" ${currentPage === 1 ? 'disabled' : ''}>
              <svg><use xlink:href="/img/icons.svg#icon-chevron-left"></use></svg>
            </button>
            <span class="admin-panel__page-info">Page ${currentPage} of ${totalPages}</span>
            <button class="admin-panel__page-btn" data-page="${
              currentPage + 1
            }" ${currentPage === totalPages ? 'disabled' : ''}>
              <svg><use xlink:href="/img/icons.svg#icon-chevron-right"></use></svg>
            </button>
          </div>
        `
            : ''
        }
      </div>
    `;

    container.innerHTML = html;

    // Event Listeners
    const searchInput = document.getElementById('tour-search');
    const sortSelect = document.getElementById('tour-sort');
    const limitSelect = document.getElementById('tour-limit');

    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = e.target.value;
        currentPage = 1;
        render();
      }, 300);
    });

    sortSelect?.addEventListener('change', (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      render();
    });

    limitSelect?.addEventListener('change', (e) => {
      currentLimit = parseInt(e.target.value);
      currentPage = 1;
      render();
    });

    container.querySelectorAll('.admin-panel__page-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.currentTarget.dataset.page);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          render();
        }
      });
    });

    container.querySelectorAll('.admin-panel__btn--delete').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this tour?')) {
          const deleted = await deleteTour(id);
          if (deleted) render();
        }
      });
    });
  };

  render();
};

// ========== RENDER ADMIN USERS ==========
export const renderAdminUsers = (container) => {
  if (!container) return;

  let currentPage = 1;
  let currentLimit = 10;
  let currentSearch = '';
  let currentRole = '';

  const render = () => {
    let filtered = filterData(allUsers, currentSearch, ['name', 'email']);
    if (currentRole) filtered = filtered.filter((u) => u.role === currentRole);
    const total = filtered.length;
    const totalPages = Math.ceil(total / currentLimit);
    const paginated = paginateData(filtered, currentPage, currentLimit);

    let html = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg class="admin-panel__icon"><use xlink:href="/img/icons.svg#icon-users"></use></svg>
            Users Management
          </h3>
          <div class="admin-panel__header-actions" style="display: flex; align-items: center; gap: 1rem;">
            <a href="/create-user" class="btn btn--small btn--green">Create New User</a>
            <span class="admin-panel__count">${total} users</span>
          </div>
        </div>
        
        <div class="admin-panel__controls">
          <div class="admin-panel__search">
            <svg class="admin-panel__search-icon"><use xlink:href="/img/icons.svg#icon-search"></use></svg>
            <input type="text" id="user-search" class="admin-panel__input" placeholder="Search users..." value="${currentSearch}">
          </div>
          <select id="user-role" class="admin-panel__select">
            <option value="">All Roles</option>
            <option value="user" ${
              currentRole === 'user' ? 'selected' : ''
            }>Users</option>
            <option value="guide" ${
              currentRole === 'guide' ? 'selected' : ''
            }>Guides</option>
            <option value="lead-guide" ${
              currentRole === 'lead-guide' ? 'selected' : ''
            }>Lead Guides</option>
            <option value="admin" ${
              currentRole === 'admin' ? 'selected' : ''
            }>Admins</option>
          </select>
          <select id="user-limit" class="admin-panel__select">
            <option value="10" ${
              currentLimit === 10 ? 'selected' : ''
            }>10</option>
            <option value="25" ${
              currentLimit === 25 ? 'selected' : ''
            }>25</option>
            <option value="50" ${
              currentLimit === 50 ? 'selected' : ''
            }>50</option>
          </select>
        </div>

        <div class="admin-panel__table-wrap">
          ${
            paginated.length === 0
              ? `
            <div class="admin-panel__empty">
              <svg class="admin-panel__empty-icon"><use xlink:href="/img/icons.svg#icon-user"></use></svg>
              <p>No users found</p>
            </div>
          `
              : `
            <table class="admin-panel__table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${paginated
                  .map(
                    (user) => `
                  <tr>
                    <td>
                      <div class="admin-panel__user">
                        <img src="/img/users/${user.photo}" alt="${user.name}" class="admin-panel__user-img">
                        <span>${user.name}</span>
                      </div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="admin-panel__badge admin-panel__badge--${user.role}">${user.role}</span></td>
                    <td>
                      <div class="admin-panel__actions">
                        <a href="/edit-user/${user._id}" class="admin-panel__btn admin-panel__btn--edit" title="Edit">
                          <svg><use xlink:href="/img/icons.svg#icon-edit"></use></svg>
                        </a>
                        <button class="admin-panel__btn admin-panel__btn--delete" data-id="${user._id}" title="Delete">
                          <svg><use xlink:href="/img/icons.svg#icon-trash"></use></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
          }
        </div>

        ${
          totalPages > 1
            ? `
          <div class="admin-panel__pagination">
            <button class="admin-panel__page-btn" data-page="${
              currentPage - 1
            }" ${currentPage === 1 ? 'disabled' : ''}>
              <svg><use xlink:href="/img/icons.svg#icon-chevron-left"></use></svg>
            </button>
            <span class="admin-panel__page-info">Page ${currentPage} of ${totalPages}</span>
            <button class="admin-panel__page-btn" data-page="${
              currentPage + 1
            }" ${currentPage === totalPages ? 'disabled' : ''}>
              <svg><use xlink:href="/img/icons.svg#icon-chevron-right"></use></svg>
            </button>
          </div>
        `
            : ''
        }
      </div>
    `;

    container.innerHTML = html;

    // Event Listeners
    const searchInput = document.getElementById('user-search');
    const roleSelect = document.getElementById('user-role');
    const limitSelect = document.getElementById('user-limit');

    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = e.target.value;
        currentPage = 1;
        render();
      }, 300);
    });

    roleSelect?.addEventListener('change', (e) => {
      currentRole = e.target.value;
      currentPage = 1;
      render();
    });

    limitSelect?.addEventListener('change', (e) => {
      currentLimit = parseInt(e.target.value);
      currentPage = 1;
      render();
    });

    container.querySelectorAll('.admin-panel__page-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.currentTarget.dataset.page);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          render();
        }
      });
    });

    container.querySelectorAll('.admin-panel__btn--delete').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this user?')) {
          const deleted = await deleteUser(id);
          if (deleted) render();
        }
      });
    });
  };

  render();
};

// ========== RENDER ADMIN REVIEWS ==========
export const renderAdminReviews = (container) => {
  if (!container) return;

  let currentPage = 1;
  let currentLimit = 10;
  let currentRating = '';

  const render = () => {
    let filtered = [...allReviews];
    if (currentRating)
      filtered = filtered.filter((r) => r.rating === parseInt(currentRating));
    const total = filtered.length;
    const totalPages = Math.ceil(total / currentLimit);
    const paginated = paginateData(filtered, currentPage, currentLimit);

    let html = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg class="admin-panel__icon"><use xlink:href="/img/icons.svg#icon-star"></use></svg>
            Reviews Management
          </h3>
          <span class="admin-panel__count">${total} reviews</span>
        </div>
        
        <div class="admin-panel__controls">
          <select id="review-rating" class="admin-panel__select">
            <option value="">All Ratings</option>
            <option value="5" ${
              currentRating === '5' ? 'selected' : ''
            }>⭐⭐⭐⭐⭐ (5)</option>
            <option value="4" ${
              currentRating === '4' ? 'selected' : ''
            }>⭐⭐⭐⭐ (4)</option>
            <option value="3" ${
              currentRating === '3' ? 'selected' : ''
            }>⭐⭐⭐ (3)</option>
            <option value="2" ${
              currentRating === '2' ? 'selected' : ''
            }>⭐⭐ (2)</option>
            <option value="1" ${
              currentRating === '1' ? 'selected' : ''
            }>⭐ (1)</option>
          </select>
          <select id="review-limit" class="admin-panel__select">
            <option value="10" ${
              currentLimit === 10 ? 'selected' : ''
            }>10</option>
            <option value="25" ${
              currentLimit === 25 ? 'selected' : ''
            }>25</option>
            <option value="50" ${
              currentLimit === 50 ? 'selected' : ''
            }>50</option>
          </select>
        </div>

        <div class="admin-panel__table-wrap">
          ${
            paginated.length === 0
              ? `
            <div class="admin-panel__empty">
              <svg class="admin-panel__empty-icon"><use xlink:href="/img/icons.svg#icon-star"></use></svg>
              <p>No reviews found</p>
            </div>
          `
              : `
            <table class="admin-panel__table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${paginated
                  .map(
                    (review) => `
                  <tr>
                    <td>${review.tour?.name || 'Unknown'}</td>
                    <td>
                      <div class="admin-panel__user">
                        <img src="/img/users/${
                          review.user?.photo || 'default.jpg'
                        }" alt="${
                      review.user?.name
                    }" class="admin-panel__user-img">
                        <span>${review.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <span class="admin-panel__rating">
                        ${'⭐'.repeat(review.rating)}
                      </span>
                    </td>
                    <td class="admin-panel__review-text">${
                      review.review?.substring(0, 60) || ''
                    }${review.review?.length > 60 ? '...' : ''}</td>
                    <td>
                      <div class="admin-panel__actions">
                        <button class="admin-panel__btn admin-panel__btn--edit" data-id="${
                          review._id
                        }" title="Edit">
                          <svg><use xlink:href="/img/icons.svg#icon-edit"></use></svg>
                        </button>
                        <button class="admin-panel__btn admin-panel__btn--delete" data-id="${
                          review._id
                        }" title="Delete">
                          <svg><use xlink:href="/img/icons.svg#icon-trash"></use></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
          }
        </div>

        ${
          totalPages > 1
            ? `
          <div class="admin-panel__pagination">
            <button class="admin-panel__page-btn" data-page="${
              currentPage - 1
            }" ${currentPage === 1 ? 'disabled' : ''}>
              <svg><use xlink:href="/img/icons.svg#icon-chevron-left"></use></svg>
            </button>
            <span class="admin-panel__page-info">Page ${currentPage} of ${totalPages}</span>
            <button class="admin-panel__page-btn" data-page="${
              currentPage + 1
            }" ${currentPage === totalPages ? 'disabled' : ''}>
              <svg><use xlink:href="/img/icons.svg#icon-chevron-right"></use></svg>
            </button>
          </div>
        `
            : ''
        }
      </div>
    `;

    container.innerHTML = html;

    // Event Listeners
    const ratingSelect = document.getElementById('review-rating');
    const limitSelect = document.getElementById('review-limit');

    ratingSelect?.addEventListener('change', (e) => {
      currentRating = e.target.value;
      currentPage = 1;
      render();
    });

    limitSelect?.addEventListener('change', (e) => {
      currentLimit = parseInt(e.target.value);
      currentPage = 1;
      render();
    });

    container.querySelectorAll('.admin-panel__page-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.currentTarget.dataset.page);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          render();
        }
      });
    });

    container.querySelectorAll('.admin-panel__btn--delete').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this review?')) {
          const deleted = await deleteAdminReview(id);
          if (deleted) render();
        }
      });
    });
  };

  render();
};

// ========== RENDER ADMIN BOOKINGS ==========
export const renderAdminBookings = (container) => {
  if (!container) return;

  let currentPage = 1;
  let currentLimit = 10;

  const render = () => {
    const total = allBookings.length;
    const totalPages = Math.ceil(total / currentLimit);
    const paginated = paginateData(allBookings, currentPage, currentLimit);

    let html = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg class="admin-panel__icon"><use xlink:href="/img/icons.svg#icon-briefcase"></use></svg>
            Bookings Management
          </h3>
          <span class="admin-panel__count">${total} bookings</span>
        </div>
        
        <div class="admin-panel__controls">
          <select id="booking-limit" class="admin-panel__select">
            <option value="10" ${
              currentLimit === 10 ? 'selected' : ''
            }>10 per page</option>
            <option value="25" ${
              currentLimit === 25 ? 'selected' : ''
            }>25 per page</option>
            <option value="50" ${
              currentLimit === 50 ? 'selected' : ''
            }>50 per page</option>
          </select>
        </div>

        <div class="admin-panel__table-wrap">
          ${
            paginated.length === 0
              ? `
            <div class="admin-panel__empty">
              <svg class="admin-panel__empty-icon"><use xlink:href="/img/icons.svg#icon-briefcase"></use></svg>
              <p>No bookings found</p>
            </div>
          `
              : `
            <table class="admin-panel__table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>User</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${paginated
                  .map(
                    (booking) => `
                  <tr>
                    <td>${booking.tour?.name || 'Unknown'}</td>
                    <td>
                      <div class="admin-panel__user">
                        <img src="/img/users/${
                          booking.user?.photo || 'default.jpg'
                        }" alt="${
                      booking.user?.name
                    }" class="admin-panel__user-img">
                        <span>${booking.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td><span class="admin-panel__price">EGP ${
                      booking.price
                    }</span></td>
                    <td>${new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div class="admin-panel__actions">
                        <button class="admin-panel__btn admin-panel__btn--edit" data-id="${
                          booking._id
                        }" title="Edit">
                          <svg><use xlink:href="/img/icons.svg#icon-edit"></use></svg>
                        </button>
                        <button class="admin-panel__btn admin-panel__btn--delete" data-id="${
                          booking._id
                        }" title="Delete">
                          <svg><use xlink:href="/img/icons.svg#icon-trash"></use></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
          }
        </div>

        ${
          totalPages > 1
            ? `
          <div class="admin-panel__pagination">
            <button class="admin-panel__page-btn" data-page="${
              currentPage - 1
            }" ${currentPage === 1 ? 'disabled' : ''}>
              <svg><use xlink:href="/img/icons.svg#icon-chevron-left"></use></svg>
            </button>
            <span class="admin-panel__page-info">Page ${currentPage} of ${totalPages}</span>
            <button class="admin-panel__page-btn" data-page="${
              currentPage + 1
            }" ${currentPage === totalPages ? 'disabled' : ''}>
              <svg><use xlink:href="/img/icons.svg#icon-chevron-right"></use></svg>
            </button>
          </div>
        `
            : ''
        }
      </div>
    `;

    container.innerHTML = html;

    // Event Listeners
    const limitSelect = document.getElementById('booking-limit');

    limitSelect?.addEventListener('change', (e) => {
      currentLimit = parseInt(e.target.value);
      currentPage = 1;
      render();
    });

    container.querySelectorAll('.admin-panel__page-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.currentTarget.dataset.page);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          render();
        }
      });
    });

    container.querySelectorAll('.admin-panel__btn--delete').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this booking?')) {
          const deleted = await deleteBooking(id);
          if (deleted) render();
        }
      });
    });
  };

  render();
};
