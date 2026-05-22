export default function CustomProxyGuide() {
  return (
    <div className="min-h-screen bg-white p-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900">Use Your Own Proxy</h1>

        <p className="mt-6 text-lg text-gray-500">
          Configure your own proxy provider.
        </p>

        <div
          className="
          mt-10
          border border-gray-200
          rounded-3xl
          p-8
          bg-gray-50
        "
        >
          <div className="space-y-8">
            <div>
              <h2 className="font-semibold text-lg">Step 1</h2>

              <p className="text-gray-600 mt-2">
                Buy a residential proxy from BrightData, SmartProxy or Oxylabs.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-lg">Step 2</h2>

              <p className="text-gray-600 mt-2">
                Add your proxy credentials into the extension.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-lg">Step 3</h2>

              <p className="text-gray-600 mt-2">
                Activate the extension connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
