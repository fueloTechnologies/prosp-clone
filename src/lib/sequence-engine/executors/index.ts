import { executeConnectionRequest } from "./connectionRequest";
import { executeFollowUp } from "./followUp";
import { executeWait } from "./wait";
const { executeMessage } = require("./message");

export const stepExecutors = {
  CONNECTION_REQUEST: executeConnectionRequest,
  MESSAGE: executeMessage,
  FOLLOW_UP: executeFollowUp,
  WAIT: executeWait,
  EMAIL: async () => {
    console.log("📧 EMAIL — not implemented");
    return { success: true };
  },
  VOICE_NOTE: async () => {
    console.log("🎤 VOICE_NOTE — not implemented");
    return { success: true };
  },
  WHATSAPP: async () => {
    console.log("💬 WHATSAPP — not implemented");
    return { success: true };
  },
};
