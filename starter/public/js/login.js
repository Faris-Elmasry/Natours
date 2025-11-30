import axios from 'axios';
import { showAlert } from './alerts';
  console.log("hallo from login ");
export const login = async (email, password) => {
  console.log(email);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
      withCredentials: true, // If needed
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.error('Error:', err); // Log the full error object
    if (err.response) {
      showAlert('error', err.response.data.message);
    } else {
      showAlert('error', 'An error occurred. Please try again.');
    }
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
