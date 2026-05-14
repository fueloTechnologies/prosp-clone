import AppShell from '@/components/layout/AppShell'

export default function TrainingPage() {
  return (
    <AppShell activeTab="training">

      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Training
        </h1>

        <p className="text-gray-600 mt-2">
          Training materials will appear here.
        </p>
      </div>

    </AppShell>
  )
}