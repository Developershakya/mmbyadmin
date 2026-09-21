import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRouter from "./src/server/apiRouter.js";

async function startServer() {
  // SAFETY GUARD 1 & 2: Enforce TEST mode & DUMMY booking mode
  const bookingMode = process.env.BOOKING_MODE || 'dummy';
  if (bookingMode !== 'dummy') {
    console.error('[SAFETY GUARD] FATAL: BOOKING_MODE is not "dummy". Real SRDV booking adapter is disabled.');
    throw new Error('FATAL: BOOKING_MODE must be "dummy". Real booking endpoints are permanently disabled.');
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_517hUuVvL9vQvC';
  if (!razorpayKeyId.startsWith('rzp_test_')) {
    console.error('[SAFETY GUARD] FATAL: LIVE KEY BLOCKED! RAZORPAY_KEY_ID does not start with rzp_test_.');
    throw new Error('FATAL: LIVE KEY BLOCKED! Only Razorpay test mode is permitted.');
  }

  console.log('====================================================');
  console.log(`[SAFETY GUARD] Razorpay mode: TEST (${razorpayKeyId})`);
  console.log(`[SAFETY GUARD] Booking mode: DUMMY (Real SRDV Booking Endpoints BLOCKED)`);
  console.log('====================================================');

  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // API routes go here FIRST
  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Make My Bharat Yatra Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
