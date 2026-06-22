// src/lib/sequence-engine/executors/wait.ts

export async function executeWait({ step, lastExecution }: any) {
  console.log("⏳ WAIT step — checking if wait period is over");

  if (!lastExecution?.executedAt) {
    console.log("⏳ No previous execution — waiting");
    return { success: false, waiting: true };
  }

  const waitHours = step.delay || 1;
  const waitUntil = new Date(lastExecution.executedAt);
  waitUntil.setHours(waitUntil.getHours() + waitHours);

  if (new Date() < waitUntil) {
    const remaining = Math.round(
      (waitUntil.getTime() - Date.now()) / 1000 / 60,
    );
    console.log(`⏳ Still waiting — ${remaining} minutes remaining`);
    return { success: false, waiting: true };
  }

  console.log("✅ WAIT period completed");
  return { success: true };
}
