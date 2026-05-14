"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

export default function VoicePage() {
  const router = useRouter();

  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");

  const recognitionRef = useRef<any>(null);

  // 🎤 START / STOP LISTENING
  const startListening = () => {
    console.log("BUTTON CLICKED");

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    // If already running → stop
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.start();
    setListening(true);

    recognition.onstart = () => {
      console.log("🎤 Voice started");
    };

  recognition.onresult = async (event: any) => {
  const result = event.results[event.results.length - 1];

  // 🚫 Ignore incomplete speech
  if (!result.isFinal) return;

  const transcript = result[0].transcript;

  console.log("🎤 FINAL:", transcript);

  setText(transcript);

  await handleCommand(transcript); // only once
};

recognition.onerror = (event: any) => {
  console.log("🎤 Speech issue:", event.error);

  // Ignore harmless browser speech errors
  if (
    event.error === "no-speech" ||
    event.error === "aborted" ||
    event.error === "audio-capture"
  ) {
    return;
  }

  setListening(false);
};

    recognition.onend = () => {
      console.log("🛑 Voice stopped");
      setListening(false);
    };
  };

  // 🤖 AI COMMAND HANDLER
  async function handleCommand(command: string) {
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        body: JSON.stringify({ command }),
      });

      const data = await res.json();

      console.log("🤖 AI Action:", data);

      runAction(data);
    } catch (err) {
      console.error("AI error:", err);
    }
  }


async function createContact(data: any) {

  try {

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        firstName: data.name || "",

        lastName: "",

        email: data.email || "",

        company: "",

      }),

    });

    const created = await res.json();

    console.log("✅ Contact created:", created);

    alert(
      `✅ Contact ${data.name} created`
    );

  } catch (err) {

    console.error("❌ Create contact error:", err);

  }

}


async function createCampaign(data: any) {

  try {

    const res = await fetch("/api/campaigns", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        name:
          data?.name ||
          `Voice Campaign ${Date.now()}`,

      }),

    });

    const created = await res.json();

    console.log(
      "✅ Campaign created:",
      created
    );

    alert(
      `✅ Campaign created`
    );

  } catch (err) {

    console.error(
      "❌ Campaign error:",
      err
    );

  }

}


async function sendEmail(data: any) {

  try {

    const res = await fetch("/api/email/send", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        to: data.to,

        subject: data.subject,

        content: `
          <h2>AI Generated Email</h2>
          <p>${data.message}</p>
        `,

      }),

    });

    const result = await res.json();

    console.log(
      "📧 Email result:",
      result
    );

    alert(
      `📧 Email sent to ${data.to}`
    );

  } catch (err) {

    console.error(
      "❌ Email send error:",
      err
    );

  }

}



  // ⚡ ACTION EXECUTOR
  function runAction(action: any) {
    const act = action.action?.toLowerCase()?.replace(/\s+/g, "_");

    console.log("🚀 Running:", act);

    switch (act) {
      case "start_campaign":
        alert("🚀 Starting campaign...");
        break;

     case "create_campaign":
  createCampaign(action.data);
  break;

      case "add_contact":
  createContact(action.data);
  break;

     case "send_email":
  sendEmail(action.data);
  break;

   case "go_to_page":

  if (action.data?.page) {

    alert(
      `🚀 Opening ${action.data.page}`
    );

    window.location.assign(
      action.data.page
    );

  }

break;

      default:
        alert("❌ Unknown action: " + act);
    }
  }

  return (
    <AppShell activeTab="voice">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-5">Voice Automation</h1>

        {/* BACK */}
        <button
          onClick={() => router.push("/sequences")}
          className="mb-4 bg-gray-200 px-4 py-2 rounded"
        >
          ← Back
        </button>

        {/* 🎤 BUTTON */}
        <button
          onClick={startListening}
          className={`px-6 py-3 rounded text-white ${
            listening
              ? "bg-red-500 animate-pulse"
              : "bg-purple-600"
          }`}
        >
          {listening ? "🎤 Listening..." : "🎤 Start Talking"}
        </button>

        {/* TRANSCRIPT */}
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-500">Live Transcript</p>
          <p className="text-lg font-medium">
            {text || "Say something..."}
          </p>
        </div>
      </div>
    </AppShell>
  );
}