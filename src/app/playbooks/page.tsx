import AppShell from '@/components/layout/AppShell'

export default function PlaybooksPage() {
  return (
    <AppShell activeTab="playbooks">

      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Playbooks
        </h1>

        <p className="text-gray-600 mt-2">
          Sales playbooks will appear here.
        </p>
      </div>

    </AppShell>
  )
}