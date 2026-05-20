import cron from "node-cron";

// Use global to survive hot reloads
const globalForCron = global as any;

export function startCron() {
  if (globalForCron.__cronStarted) return;
  globalForCron.__cronStarted = true;

  console.log("🟢 Cron Scheduler Started");

  // Run immediately on startup
  setTimeout(() => {
    fetch("http://localhost:3000/api/runner")
      .then(() => console.log("✅ Initial runner triggered"))
      .catch((err) => console.error("Initial runner error:", err));
  }, 3000); // wait 3s for server to be ready

  // Run every minute
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
