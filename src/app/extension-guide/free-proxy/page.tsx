export default function FreeProxyGuide() {
  const steps = [
    "Download our Extension",
    "Extract the ZIP file",
    "Go to chrome://extensions",
    "Enable Developer Mode",
    "Click Load Unpacked",
    "Select the extracted folder",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Gradient */}
      <div
        className="
        h-48
        bg-gradient-to-r
        from-violet-600
        to-purple-300
      "
      />

      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-[1fr_280px] gap-20">
          {/* LEFT CONTENT */}
          <div>
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-8">
              All Collections
              {" > "}
              Connecting a LinkedIn account
            </div>

            {/* Title */}
            <h1
              className="
              text-5xl
              font-bold
              leading-tight
              text-gray-900
            "
            >
              Connecting Your LinkedIn Account
              <br />
              Using The Extension
            </h1>

            {/* Author */}
            <div className="flex items-center gap-4 mt-8">
              <div
                className="
                w-12 h-12 rounded-full
                bg-purple-100
                flex items-center justify-center
                text-purple-700 font-bold
              "
              >
                YD
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  Written by Yann Dine
                </p>

                <p className="text-sm text-gray-500">June 11, 2025</p>
              </div>
            </div>

            {/* Intro */}
            <div className="mt-10 space-y-6">
              <p className="text-lg text-gray-700 leading-8">
                The extension allows you to connect your account to Prosp, so we
                can send connections, messages and much more directly from your
                account.
              </p>

              <div
                className="
                bg-yellow-50
                border border-yellow-200
                rounded-2xl
                p-6
              "
              >
                <p className="text-gray-700 leading-8">
                  You can follow the instructions below to get started :)
                </p>
              </div>
            </div>

            {/* STEPS */}
            <div className="mt-20 space-y-24">
              {/* STEP 1 */}
              <section id="step-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Step 1: Download our Extension
                </h2>

                <p className="text-lg text-gray-700 leading-8">
                  The first step is to download our extension. This allows us to
                  make the connection between Prosp and your LinkedIn account.
                </p>

                <div
                  className="
                  mt-8
                  border border-gray-200
                  rounded-3xl
                  p-8
                  bg-gray-50
                "
                >
                  <p className="text-gray-700 mb-6">
                    This file contains all the necessary code and files for the
                    Chrome extension.
                  </p>

                  <button
                    className="
                    px-6 py-3
                    rounded-2xl
                    bg-purple-600
                    hover:bg-purple-700
                    text-white
                    font-medium
                    transition
                  "
                  >
                    Download Extension ZIP
                  </button>
                </div>
              </section>

              {/* STEP 2 */}
              <section id="step-2">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Step 2: Extract the ZIP file
                </h2>

                <p className="text-lg text-gray-700 leading-8">
                  Right-click the ZIP file and choose "Extract All" or "Unzip".
                  This creates a regular folder containing the extension files.
                </p>
                <img
                  src="/guide/step1.png"
                  alt="Extract zip"
                  className="
    mt-8
    rounded-3xl
    border border-gray-200
    shadow-lg
  "
                />
              </section>

              {/* STEP 3 */}
              <section id="step-3">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Step 3: Go to chrome://extensions
                </h2>

                <p className="text-lg text-gray-700 leading-8">
                  Open Google Chrome and type:
                </p>

                <div
                  className="
                  mt-6
                  bg-gray-900
                  text-green-400
                  rounded-2xl
                  p-5
                  font-mono
                  text-lg
                "
                >
                  chrome://extensions
                </div>
                <img
                  src="/guide/step2.png"
                  alt="Chrome extensions"
                  className="
    mt-8
    rounded-3xl
    border border-gray-200
    shadow-lg
  "
                />
              </section>

              {/* STEP 4 */}
              <section id="step-4">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Step 4: Enable Developer Mode
                </h2>

                <p className="text-lg text-gray-700 leading-8">
                  In the top-right corner of the extensions page, toggle the
                  switch labeled "Developer mode" to ON.
                </p>
                <img
                  src="/guide/step4.png"
                  alt="Load unpacked"
                  className="
    mt-8
    rounded-3xl
    border border-gray-200
    shadow-lg
  "
                />
              </section>

              {/* STEP 5 */}
              <section id="step-5">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Step 5: Click Load Unpacked
                </h2>

                <p className="text-lg text-gray-700 leading-8">
                  Press the "Load unpacked" button and navigate to the folder
                  you extracted earlier.
                </p>
                <img
                  src="/guide/step5.png"
                  alt="Select folder"
                  className="
    mt-8
    rounded-3xl
    border border-gray-200
    shadow-lg
  "
                />
              </section>

              {/* STEP 6 */}
              <section id="step-6">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Step 6: Select the extracted folder
                </h2>

                <p className="text-lg text-gray-700 leading-8">
                  Select the extracted extension folder and click Open. The
                  extension will now appear inside Chrome.
                </p>
              </section>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="sticky top-10 h-fit">
            <div className="space-y-5 border-l border-gray-200 pl-6">
              {steps.map((step, i) => (
                <a
                  key={i}
                  href={`#step-${i + 1}`}
                  className="
                    block
                    text-sm
                    text-gray-600
                    hover:text-purple-600
                    transition
                  "
                >
                  Step {i + 1}: {step}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
