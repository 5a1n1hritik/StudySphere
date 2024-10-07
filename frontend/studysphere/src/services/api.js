const API_URL = 'http://localhost:5000/api/users';

// Get Employees
const getEmployees = async () => {
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json' // Optional: If your API expects JSON
  };

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    throw error;
  }
};
