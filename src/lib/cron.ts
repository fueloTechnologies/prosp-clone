import cron from "node-cron";

const globalForCron = global as any;

export function startCron() {
  // Only run local cron in development
  // In production, Vercel cron handles /api/runner
  if (process.env.NODE_ENV === "production") {
    console.log("🟡 Production mode — using Vercel cron instead");
    return;
  }

  if (globalForCron.__cronStarted) return;
  globalForCron.__cronStarted = true;

  console.log("🟢 Cron Scheduler Started (development)");

  setTimeout(() => {
    fetch("http://localhost:3000/api/runner")
      .then(() => console.log("✅ Initial runner triggered"))
      .catch((err) => console.error("Initial runner error:", err));
  }, 3000);

  cron.schedule("* * * * *", async () => {
    try {
      console.log("⏱ Running scheduled campaign runner...");
      const res = await fetch("http://localhost:3000/api/runner");
      const data = await res.json();
      console.log("Runner result:", data);
    } catch (error) {
      console.error("Cron runner error:", error);
    }
  });
}
