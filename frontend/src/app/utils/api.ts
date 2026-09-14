import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 30000, // 30 seconds - default timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;