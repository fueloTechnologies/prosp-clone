import { executeConnectionRequest } from "./connectionRequest";
import { executeMessage } from "./message";
import { executeFollowUp } from "./followUp";
import { executeWait } from "./wait";

export const stepExecutors = {
  CONNECTION_REQUEST: executeConnectionRequest,
  MESSAGE: executeMessage,
  FOLLOW_UP: executeFollowUp,
  WAIT: executeWait,
  EMAIL: async ({ finalContent, conversation, userId }: any) => {
    console.log("📧 EMAIL step — not implemented yet");
    return { success: true };
  },
  VOICE_NOTE: async () => {
    console.log("🎤 VOICE_NOTE — not implemented yet");
    return { success: true };
  },
  WHATSAPP: async () => {
    console.log("💬 WHATSAPP — not implemented yet");
    return { success: true };
  },
};
