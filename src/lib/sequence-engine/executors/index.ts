// src/lib/sequence-engine/executors/index.ts

import { executeConnectionRequest } from "./connectionRequest";
import { executeMessage } from "./message";
import { executeFollowUp } from "./followUp";
import { executeWait } from "./wait";
import { executeEmail } from "./email";

export const stepExecutors = {
  CONNECTION_REQUEST: executeConnectionRequest,
  MESSAGE: executeMessage,
  FOLLOW_UP: executeFollowUp,
  WAIT: executeWait,
  EMAIL: executeEmail,
  // Stubs for future step types — won't crash the runner
  VOICE_NOTE: async () => {
    console.log("🎤 VOICE_NOTE — not implemented yet");
    return { success: true };
  },
  WHATSAPP: async () => {
    console.log("💬 WHATSAPP — not implemented yet");
    return { success: true };
  },
};
