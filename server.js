import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import hpp from "hpp";

const app = express();

/* =========================
   TRUST PROXY
========================= */

app.set("trust proxy", 1);

/* =========================
   BASIC SECURITY
========================= */

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: "*", // replace with frontend domain in production
    methods: ["GET"],
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(compression());

app.use(morgan("combined"));

app.use(hpp());

/* =========================
   RATE LIMITER
========================= */

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests/minute
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

/* =========================
   STATIC DATA
========================= */

const announcementData = {
  image: "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",

  title: "New Update Available",

  text:
    "We added faster performance and bug fixes. Update now for the best experience.",

  action: {
    link:
      "https://play.google.com/store/apps/details?id=com.aktubrand",
  },
};

const versionData = {
  latestVersion: "1.1.4",

  updateUrl:
    "https://play.google.com/store/apps/details?id=com.aktubrand",

  isAnnouncement: false,
};

/* =========================
   ROUTES
========================= */

// Health Check
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// Announcement API
app.get("/api/message", (req, res) => {
  return res.status(200).json({
    success: true,
    data: announcementData,
  });
});

// Version API
app.get("/api/version", (req, res) => {
    console.log("hiiii")
  return res.status(200).json({
    success: true,
    data: versionData,
    isAnnouncement:false,
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
