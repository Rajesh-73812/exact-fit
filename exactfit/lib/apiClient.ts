import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getToken } from "@/lib/getToken";

// =======================================
// 🔗 CREATE AXIOS INSTANCE
// =======================================
const apiClient: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    // "http://localhost:4446/api/",
    "https://exact-fit-server.vercel.app/api/", // <-- change from env only
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================================
// 🔐 REQUEST INTERCEPTOR
// =======================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// =======================================
// 🚨 RESPONSE INTERCEPTOR
// =======================================
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// =======================================
// 📌 OTP API FUNCTIONS
// =======================================

// 👉 Send OTP
export const requestOtp = (mobile: string) => {
  return apiClient.post("/user/user-auth/V1/request-otp", { mobile });
};

// 👉 Verify OTP
export const verifyOtp = (mobile: string, otp: string) => {
  return apiClient.post("/user/user-auth/V1/verify-otp", { mobile, otp });
};

// 👉 Resend OTP
export const resendOtp = (mobile: string) => {
  return apiClient.post("/user/user-auth/V1/resend-otp", { mobile });
};

export default apiClient;
