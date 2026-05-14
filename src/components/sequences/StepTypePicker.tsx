'use client'

export default function StepTypePicker({
  isOpen,
  onClose,
  onSelect
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: string) => void
}) {

  if (!isOpen) return null

  const steps = [

    {
      label: 'Connection Request',
      type: 'CONNECTION_REQUEST',
      description:
        'Send LinkedIn connection request'
    },

    {
      label: 'Message',
      type: 'MESSAGE',
      description:
        'Send follow-up message'
    },

    {
      label: 'Follow-up',
      type: 'FOLLOW_UP',
      description:
        'Send reminder message'
    },

    {
      label: 'Email',
      type: 'EMAIL',
      description:
        'Send email message'
    },

    {
      label: 'Wait',
      type: 'WAIT',
      description:
        'Delay before next step'
    }

  ]

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl">

        {/* TITLE */}

        <h2 className="text-lg font-semibold mb-4">

          Add Step

        </h2>



        {/* STEP OPTIONS */}

        <div className="space-y-3">

          {steps.map((step) => (

            <button

              key={step.type}

              onClick={() => {

                onSelect(step.type)

                onClose()

              }}

              className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition"

            >

              <div className="font-medium">

                {step.label}

              </div>

              <div className="text-xs text-gray-500">

                {step.description}

              </div>

            </button>

          ))}

        </div>



        {/* CANCEL */}

        <button

          onClick={onClose}

          className="mt-5 text-sm text-gray-500 hover:text-gray-700"

        >

          Cancel

        </button>

      </div>

    </div>

  )

}

