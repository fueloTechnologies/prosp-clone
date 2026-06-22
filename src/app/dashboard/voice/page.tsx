"use client";
// src/app/dashboard/voice/page.tsx

import { useState, useRef, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";

type VoiceProfile = {
  id: string;
  name: string;
  duration: number;
  createdAt: string;
  elevenLabsId?: string;
};

type Tab = "clone" | "generate" | "command";

export default function VoicePage() {
  const [activeTab, setActiveTab] = useState<Tab>("clone");

  // ── Clone tab state ──
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState("");
  const [cloning, setCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<VoiceProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  // ── Generate tab state ──
  const [genScript, setGenScript] = useState(
    "Hi {{firstName}}, I came across your profile at {{company}} and thought it would be great to connect — I think there's a real synergy between what we're both working on.",
  );
  const [genContact, setGenContact] = useState({
    firstName: "Sarah",
    company: "TechCorp",
  });
  const [generating, setGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  // ── Command tab state ──
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [commandResult, setCommandResult] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load saved profiles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("voiceProfiles");
    if (saved) setSavedProfiles(JSON.parse(saved));
  }, []);

  /* ─────────────────────────────────────────
     RECORDING
  ───────────────────────────────────────── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecorded(true);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecorded(false);
      setAudioUrl(null);
      setRecordingSeconds(0);
      setCloneSuccess(false);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert(
        "Microphone access denied. Please allow microphone access and try again.",
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const discardRecording = () => {
    setRecorded(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
  };

  /* ─────────────────────────────────────────
     CLONE / SAVE VOICE
  ───────────────────────────────────────── */
  const saveVoiceProfile = async () => {
    if (!audioBlob || !voiceName.trim()) {
      alert("Please record audio and enter a name.");
      return;
    }

    setCloning(true);

    try {
      // Try ElevenLabs if key exists
      const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      let elevenLabsId: string | undefined;

      if (elevenLabsKey) {
        const formData = new FormData();
        formData.append("name", voiceName);
        formData.append(
          "description",
          "Cloned voice for LinkedIn outreach automation",
        );
        formData.append("files", audioBlob, "voice-sample.webm");

        const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
          method: "POST",
          headers: { "xi-api-key": elevenLabsKey },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          elevenLabsId = data.voice_id;
        }
      }

      // Save profile locally
      const profile: VoiceProfile = {
        id: Date.now().toString(),
        name: voiceName,
        duration: recordingSeconds,
        createdAt: new Date().toISOString(),
        elevenLabsId,
      };

      const updated = [profile, ...savedProfiles];
      setSavedProfiles(updated);
      localStorage.setItem("voiceProfiles", JSON.stringify(updated));
      setSelectedProfile(profile.id);
      setCloneSuccess(true);
      setVoiceName("");
      discardRecording();
    } catch (err) {
      console.error("Clone error:", err);
      alert("Failed to save voice profile.");
    } finally {
      setCloning(false);
    }
  };

  /* ─────────────────────────────────────────
     GENERATE VOICE NOTE
  ───────────────────────────────────────── */
  const generateVoiceNote = async () => {
    const profile = savedProfiles.find((p) => p.id === selectedProfile);
    if (!profile) {
      alert("Please select a voice profile first.");
      return;
    }

    const personalized = genScript
      .replace(/{{firstName}}/g, genContact.firstName)
      .replace(/{{company}}/g, genContact.company);

    setGenerating(true);
    setGeneratedAudio(null);

    try {
      if (profile.elevenLabsId) {
        // Real ElevenLabs TTS
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${profile.elevenLabsId}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: personalized,
              model_id: "eleven_monolingual_v1",
              voice_settings: { stability: 0.5, similarity_boost: 0.8 },
            }),
          },
        );

        if (res.ok) {
          const blob = await res.blob();
          setGeneratedAudio(URL.createObjectURL(blob));
        } else {
          throw new Error("ElevenLabs TTS failed");
        }
      } else {
        // Fallback: browser TTS preview
        const utterance = new SpeechSynthesisUtterance(personalized);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
        // Show a visual indicator that it's "playing"
        setGeneratedAudio("browser-tts");
      }
    } catch (err) {
      console.error("Generate error:", err);
      alert("Voice generation failed. Check your ElevenLabs API key.");
    } finally {
      setGenerating(false);
    }
  };

  /* ─────────────────────────────────────────
     VOICE COMMAND
  ───────────────────────────────────────── */
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event: any) => {
      const t = event.results[0][0].transcript;
      setTranscript(t);
      setListening(false);

      // Send to voice API
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: t }),
      });
      const data = await res.json();
      setCommandResult(data);

      // Execute action
      if (data.action === "go_to_page" && data.data?.page) {
        setTimeout(() => (window.location.href = data.data.page), 1200);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognition.start();
    setListening(true);
    setTranscript("");
    setCommandResult(null);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <AppShell activeTab="voice">
      <div className="flex-1 overflow-y-auto bg-[#fafafe]">
        {/* PAGE HEADER */}
        <div className="border-b border-[#ececf4] bg-white px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-lg">
              🎙
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Voice Cloner</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">
            Record your voice once. Send personalized voice notes to every lead
            automatically.
          </p>
        </div>

        {/* TABS */}
        <div className="border-b border-[#ececf4] bg-white px-8">
          <div className="flex gap-8">
            {(
              [
                { id: "clone", label: "🎙 Clone Voice" },
                { id: "generate", label: "⚡ Generate Note" },
                { id: "command", label: "🤖 Voice Commands" },
              ] as { id: Tab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-12 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 max-w-3xl">
          {/* ════════════════════════════
              TAB 1 — CLONE VOICE
          ════════════════════════════ */}
          {activeTab === "clone" && (
            <div className="space-y-6">
              {/* Intro card */}
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-5">
                <h2 className="font-semibold text-gray-900 mb-1">
                  How it works
                </h2>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Record at least 30 seconds of your voice</li>
                  <li>Name and save the voice profile</li>
                  <li>
                    Use it in the Generate tab to create personalized voice
                    notes
                  </li>
                </ol>
              </div>

              {/* Recorder */}
              <div className="bg-white border border-[#ececf4] rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Record Voice Sample
                </h3>

                {/* Big record button */}
                <div className="flex flex-col items-center py-8">
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-200 shadow-lg ${
                      recording
                        ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110 shadow-red-200"
                        : "bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:scale-105 shadow-violet-200"
                    }`}
                  >
                    {recording ? "⏹" : "🎙"}
                  </button>

                  <p className="mt-4 text-sm text-gray-500">
                    {recording ? (
                      <span className="text-red-500 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block" />
                        Recording {formatTime(recordingSeconds)}
                      </span>
                    ) : recorded ? (
                      <span className="text-green-600 font-medium">
                        ✓ Recording saved ({formatTime(recordingSeconds)})
                      </span>
                    ) : (
                      "Click to start recording"
                    )}
                  </p>
                </div>

                {/* Playback */}
                {audioUrl && (
                  <div className="mt-2 mb-5">
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Preview
                    </label>
                    <audio controls src={audioUrl} className="w-full h-10" />
                  </div>
                )}

                {/* Name + save */}
                {recorded && (
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Voice Profile Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. My LinkedIn Voice"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveVoiceProfile}
                        disabled={cloning || !voiceName.trim()}
                        className="flex-1 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all"
                      >
                        {cloning ? "Cloning…" : "✨ Save & Clone Voice"}
                      </button>
                      <button
                        onClick={discardRecording}
                        className="h-10 px-4 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}

                {cloneSuccess && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium text-center">
                    ✅ Voice profile saved! Go to Generate tab to create voice
                    notes.
                  </div>
                )}
              </div>

              {/* Saved profiles */}
              {savedProfiles.length > 0 && (
                <div className="bg-white border border-[#ececf4] rounded-2xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Saved Voice Profiles
                  </h3>
                  <div className="space-y-2">
                    {savedProfiles.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProfile(p.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedProfile === p.id
                            ? "border-violet-400 bg-violet-50"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-sm">
                            🎙
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {p.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatTime(p.duration)} •{" "}
                              {new Date(p.createdAt).toLocaleDateString()}
                              {p.elevenLabsId && (
                                <span className="ml-2 text-violet-500 font-medium">
                                  ElevenLabs ✓
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedProfile === p.id && (
                          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════
              TAB 2 — GENERATE
          ════════════════════════════ */}
          {activeTab === "generate" && (
            <div className="space-y-5">
              {savedProfiles.length === 0 ? (
                <div className="bg-white border border-dashed border-[#d7d7e4] rounded-2xl py-20 text-center">
                  <div className="text-4xl mb-3">🎙</div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    No voice profiles yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Record your voice first in the Clone Voice tab
                  </p>
                  <button
                    onClick={() => setActiveTab("clone")}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
                  >
                    Record Now
                  </button>
                </div>
              ) : (
                <>
                  {/* Select profile */}
                  <div className="bg-white border border-[#ececf4] rounded-2xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Voice Profile
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {savedProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProfile(p.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            selectedProfile === p.id
                              ? "bg-violet-600 text-white border-violet-600"
                              : "border-gray-200 text-gray-700 hover:border-violet-300"
                          }`}
                        >
                          🎙 {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Script editor */}
                  <div className="bg-white border border-[#ececf4] rounded-2xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Voice Note Script
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      Use {`{{firstName}}`} and {`{{company}}`} — they'll be
                      replaced per contact
                    </p>

                    <div className="flex gap-2 mb-3">
                      {["firstName", "company"].map((v) => (
                        <button
                          key={v}
                          onClick={() => setGenScript((s) => s + ` {{${v}}}`)}
                          className="text-xs px-2.5 py-1 border border-gray-200 rounded-full hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors"
                        >
                          {v}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={genScript}
                      onChange={(e) => setGenScript(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                    />
                  </div>

                  {/* Preview contact */}
                  <div className="bg-white border border-[#ececf4] rounded-2xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Preview Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          First Name
                        </label>
                        <input
                          value={genContact.firstName}
                          onChange={(e) =>
                            setGenContact((c) => ({
                              ...c,
                              firstName: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Company
                        </label>
                        <input
                          value={genContact.company}
                          onChange={(e) =>
                            setGenContact((c) => ({
                              ...c,
                              company: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                        />
                      </div>
                    </div>

                    {/* Personalized preview */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 italic border border-gray-100">
                      "
                      {genScript
                        .replace(/{{firstName}}/g, genContact.firstName)
                        .replace(/{{company}}/g, genContact.company)}
                      "
                    </div>
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={generateVoiceNote}
                    disabled={generating || !selectedProfile}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm shadow-lg shadow-violet-200 hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {generating ? "Generating…" : "⚡ Generate Voice Note"}
                  </button>

                  {/* Generated audio */}
                  {generatedAudio && generatedAudio !== "browser-tts" && (
                    <div className="bg-white border border-[#ececf4] rounded-2xl p-5">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Generated Voice Note
                      </h3>
                      <audio
                        controls
                        src={generatedAudio}
                        className="w-full"
                        autoPlay
                      />
                      <div className="flex gap-2 mt-3">
                        <a
                          href={generatedAudio}
                          download="voice-note.mp3"
                          className="flex-1 h-9 rounded-xl bg-violet-600 text-white text-sm font-medium flex items-center justify-center hover:bg-violet-700"
                        >
                          ⬇ Download
                        </a>
                      </div>
                    </div>
                  )}

                  {generatedAudio === "browser-tts" && (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-700 font-medium text-center">
                      🔊 Playing via browser TTS (add ElevenLabs key for real
                      voice cloning)
                    </div>
                  )}

                  {/* ElevenLabs CTA if no key */}
                  {!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                      <p className="text-sm text-amber-800 font-medium mb-1">
                        🔑 Add ElevenLabs for real voice cloning
                      </p>
                      <p className="text-xs text-amber-700 mb-2">
                        Add{" "}
                        <code className="bg-amber-100 px-1 rounded">
                          NEXT_PUBLIC_ELEVENLABS_API_KEY
                        </code>{" "}
                        to your .env to enable real AI voice cloning. Currently
                        using browser TTS as fallback.
                      </p>
                      <a
                        href="https://elevenlabs.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-800 underline"
                      >
                        Get API key →
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════
              TAB 3 — VOICE COMMANDS
          ════════════════════════════ */}
          {activeTab === "command" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-5">
                <h2 className="font-semibold text-gray-900 mb-2">
                  What you can say
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  {[
                    ["Add contact John at john@acme.com", "Creates a contact"],
                    ["Create campaign Q3 Outreach", "Creates a new campaign"],
                    ["Go to sequences", "Navigates to the page"],
                    ["Go to inbox", "Opens unified inbox"],
                    ["Send email to hi@acme.com", "Sends an email"],
                    ["Launch campaign", "Starts active campaign"],
                  ].map(([cmd, desc]) => (
                    <div
                      key={cmd}
                      className="bg-white rounded-xl p-3 border border-violet-100"
                    >
                      <div className="font-medium text-gray-800 text-xs mb-0.5">
                        "{cmd}"
                      </div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mic button */}
              <div className="bg-white border border-[#ececf4] rounded-2xl p-8 flex flex-col items-center">
                <button
                  onClick={toggleListening}
                  className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl transition-all duration-200 shadow-xl ${
                    listening
                      ? "bg-red-500 animate-pulse scale-110 shadow-red-200"
                      : "bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:scale-105 shadow-violet-200"
                  }`}
                >
                  {listening ? "⏹" : "🎙"}
                </button>
                <p className="mt-5 text-sm font-medium text-gray-600">
                  {listening ? (
                    <span className="text-red-500 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block" />
                      Listening…
                    </span>
                  ) : (
                    "Tap and speak a command"
                  )}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-white border border-[#ececf4] rounded-2xl p-5">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    You said
                  </div>
                  <p className="text-gray-800 font-medium">"{transcript}"</p>
                </div>
              )}

              {/* Result */}
              {commandResult && (
                <div
                  className={`rounded-2xl p-5 border ${
                    commandResult.action === "unknown" ||
                    commandResult.action === "error"
                      ? "bg-red-50 border-red-100"
                      : "bg-green-50 border-green-100"
                  }`}
                >
                  <div className="text-xs font-medium uppercase tracking-wide mb-2 text-gray-500">
                    Action
                  </div>
                  <div className="font-semibold text-gray-800">
                    {commandResult.action === "unknown"
                      ? "❓ Command not recognized"
                      : commandResult.action === "go_to_page"
                        ? `🚀 Navigating to ${commandResult.data?.page}…`
                        : commandResult.action === "add_contact"
                          ? `👤 Adding contact: ${commandResult.data?.name}`
                          : commandResult.action === "create_campaign"
                            ? `📋 Creating campaign: ${commandResult.data?.name}`
                            : commandResult.action === "send_email"
                              ? `📧 Sending email to: ${commandResult.data?.to}`
                              : `⚡ ${commandResult.action}`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
