import axios from "axios";

// 1. URLs and setup (This part is correct)
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// 2. Create an axios instance
const api = axios.create({
    baseURL: `${BACKEND_URL}/api`, // Assuming your FastAPI routes are under /api
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); 
    console.log("Using token:", token); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/auth/users/me');
    console.log('✅ Successfully fetched current user:', response.data);
    console.log("User Id:", response.data.id); // Debugging line
    localStorage.setItem("CurrentUserId", response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ Error in fetchCurrentUser:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export default api;