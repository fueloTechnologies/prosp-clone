import cron from "node-cron";

let started = false;

export function startCron() {
  if (started) return;
  started = true;

  console.log("🟢 Cron Scheduler Started");

  // Runs every hour instead of every minute
  // Manual trigger happens via Launch Campaign button
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("⏱ Running scheduled campaign runner...");
      await fetch("http://localhost:3000/api/runner");
    } catch (error) {
      console.error("Cron runner error:", error);
    }
  });
}
