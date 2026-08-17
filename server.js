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
  image: "https://blogger.googleusercontent.com/img/a/AVvXsEjpcMlpi8R67bIv7SkI7eVZWNV5y6QeIkZDkWwIq8tx6go2KIMniMHHwbZJE9IOgI0HjfxwRloNao_3Rmu45GeaBPnE7PEs6PJQGHD_e-NUb0mtwCzhOU0Io8WUzwNfcMEGzLhNEqHulfvu3D2vJfiN3a8n0UkMBtASi3VA1p7KNDvNz2YrjsyXybTU71g",

  title: "Your Free AKTU Study Hub.",

  text:
    "Notes, PYQs, syllabus and exam resources — completely free.",

  action: {
    link:
      "https://study.aktubrand.online",
  },
};

const versionData = {
  latestVersion: "1.1.4",

  updateUrl:
    "https://play.google.com/store/apps/details?id=com.aktubrand",

  isAnnouncement: true,
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
