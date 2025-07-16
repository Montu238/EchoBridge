export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  sameSite: "strict", // Prevent CSRF attacks
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export const CORS_OPTIONS = {
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Allow requests from the client URL
  credentials: true, // Allow cookies to be sent with request
};