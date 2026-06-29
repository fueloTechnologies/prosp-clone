"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Download,
  FolderOpen,
  Chrome,
  ToggleRight,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  Puzzle,
  ExternalLink,
} from "lucide-react";

const STEPS: {
  number: number;
  icon: any;
  title: string;
  description: string;
  hint?: string;
  action?: string;
  code?: string;
  image?: string;
}[] = [
  {
    number: 1,
    icon: Download,
    title: "Download the Extension",
    description:
      "Download our Chrome extension ZIP file to your computer. This contains all the files needed to connect your LinkedIn account.",
    action: "download",
  },
  {
    number: 2,
    icon: FolderOpen,
    title: "Extract the ZIP File",
    description:
      'Right-click the downloaded ZIP file and choose "Extract All" or "Unzip". This creates a folder with the extension files inside.',
    hint: 'On Windows: Right-click → "Extract All". On Mac: Double-click the ZIP.',
    image: "/guide/step1.png",
  },
  {
    number: 3,
    icon: Chrome,
    title: "Open Chrome Extensions Page",
    description:
      "Open Google Chrome and navigate to the extensions management page by typing the address below into your address bar.",
    action: "copy-url",
    code: "chrome://extensions/",
    image: "/guide/step2.png",
  },
  {
    number: 4,
    icon: ToggleRight,
    title: "Enable Developer Mode",
    description:
      'In the top-right corner of the Extensions page, toggle "Developer mode" ON. This unlocks the ability to load extensions manually.',
    image: "/guide/step3.png",
  },
  {
    number: 5,
    icon: Upload,
    title: 'Click "Load Unpacked"',
    description:
      'A "Load unpacked" button will appear. Click it, navigate to the folder you extracted in Step 2, select that folder, and click "Open".',
    image: "/guide/step4.png",
  },
  {
    number: 6,
    icon: Puzzle,
    title: "Connect Your LinkedIn Account",
    description:
      'The extension is now installed! Go to Settings → Accounts, click "Add a LinkedIn account", choose "Connect with our extension", and follow the on-screen instructions.',
    action: "go-to-settings",
    image: "/guide/step5.png",
  },
];

function StepCard({
  step,
  isLast,
  onDownload,
  onGoToSettings,
}: {
  step: (typeof STEPS)[0];
  isLast: boolean;
  onDownload: () => void;
  onGoToSettings: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = step.icon;

  function handleCopy() {
    if (step.code) {
      navigator.clipboard.writeText(step.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md shadow-purple-200">
          {step.number}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-purple-200 to-transparent mt-2 min-h-[32px]" />
        )}
      </div>

      <div className="pb-8 flex-1">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <Icon size={15} className="text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-base">{step.title}</h3>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-3">
          {step.description}
        </p>

        {step.hint && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-3">
            <p className="text-xs text-amber-700">{step.hint}</p>
          </div>
        )}

        {step.code && (
          <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-4 py-3 mb-3 w-fit">
            <code className="text-green-400 text-sm font-mono">{step.code}</code>
            <button
              onClick={handleCopy}
              className="ml-2 p-1 rounded text-gray-400 hover:text-white transition"
            >
              {copied ? (
                <Check size={13} className="text-green-400" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        )}

        {step.image && (
          <div className="mb-3 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <Image
              src={step.image}
              alt={step.title}
              width={600}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {step.action === "download" && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition shadow-sm shadow-purple-200"
          >
            <Download size={15} />
            Download Extension ZIP
          </button>
        )}

        {step.action === "go-to-settings" && (
          <button
            onClick={onGoToSettings}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition shadow-sm shadow-purple-200"
          >
            Go to Account Settings
            <ExternalLink size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ExtensionGuidePage() {
  const router = useRouter();
  const [downloaded, setDownloaded] = useState(false);

  function handleDownload() {
    const link = document.createElement("a");
    link.href = "/guide/lin-c-extension.zip";
    link.download = "lin-c-extension.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
  }

  function handleGoToSettings() {
    router.push("/settings?tab=Accounts");
  }

  return (
    // ✅ Key fix: overflow-y-auto on the root so it scrolls independently
    <div className="w-full h-screen overflow-y-auto bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
              <Puzzle size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              Extension Setup Guide
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <Puzzle size={12} />
            Chrome Extension
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connect LinkedIn via Extension
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            The easiest and safest way to connect your LinkedIn account. Our
            Chrome extension reads your active session — no password required.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Setup time", value: "~2 min" },
              { label: "Password needed", value: "No" },
              { label: "Difficulty", value: "Easy" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center shadow-sm"
              >
                <p className="text-base font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 pt-7 pb-2">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              isLast={i === STEPS.length - 1}
              onDownload={handleDownload}
              onGoToSettings={handleGoToSettings}
            />
          ))}
        </div>

        {downloaded && (
          <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
            <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Extension downloaded!
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Continue with Step 2 — extract the ZIP file.
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8 pb-8">
          Having trouble?{" "}
          <a href="mailto:support@linc.app" className="text-purple-600 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}