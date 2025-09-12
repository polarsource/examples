import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN}`,
  },
});

export default axiosInstance;
