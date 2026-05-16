import dotenv from "dotenv";

dotenv.config();
import express from "express";
import helmet from "helmet"; 
import rateLimit from "express-rate-limit"; 
import cors from "cors" ;
import  compression from "compression";
import morgan from "morgan";
import xss  from "xss-clean";
import hpp from "hpp";

const app = express();

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
    origin: "*", // change to your frontend domain in production
    methods: ["GET"],
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(compression());

app.use(morgan("combined"));

app.use(xss());

app.use(hpp());

/* =========================
   RATE LIMITING
   1 REQUEST / MINUTE
========================= */

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please wait 1 minute.",
  },
});

app.use("/api/", strictLimiter);

/* =========================
   IN-MEMORY DATA
   (Replace with DB later)
========================= */

const announcementData = {
  image:
    "https://yourcdn.com/banner.jpg",

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
};

/* =========================
   ROUTES
========================= */

// Health Check
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API is running securely",
  });
});

/*
  GET ANNOUNCEMENT API
*/
app.get("/api/message", (req, res) => {
  return res.status(200).json({
    success: true,
    data: announcementData,
  });
});

/*
  GET VERSION API
*/
app.get("/api/version", (req, res) => {
  return res.status(200).json(versionData,{
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});
