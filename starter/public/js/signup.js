import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, confpassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        confpassword,
      },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfully! Redirecting...');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.error('Error:', err);
    if (err.response && err.response.data.message) {
      showAlert('error', err.response.data.message);
    } else {
      showAlert('error', 'An error occurred during signup. Please try again.');
    }
  }
};
