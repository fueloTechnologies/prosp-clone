"use client"

import AppShell from '@/components/layout/AppShell'
import { useEffect, useState } from 'react'

export default function SettingsPage() {

  const [accounts, setAccounts] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [showAdd, setShowAdd] =
    useState(false)

  const [name, setName] =
    useState('')

  const [profileUrl, setProfileUrl] =
    useState('')


  /* =========================
     LOAD ACCOUNTS
  ========================= */

  useEffect(() => {

    fetchAccounts()

  }, [])


  async function fetchAccounts() {

    try {

      const res =
        await fetch('/api/linkedin-accounts')

      const data =
        await res.json()

      setAccounts(data)

    }

    catch (err) {

      console.error(err)

    }

    finally {

      setLoading(false)

    }

  }


  /* =========================
     ADD ACCOUNT
  ========================= */

  async function addAccount() {

    try {

      await fetch(
        '/api/linkedin-accounts',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({

            name,

            profileUrl,

            cookie: "dummy-cookie"

          })

        }
      )

      setShowAdd(false)

      fetchAccounts()

    }

    catch (err) {

      console.error(err)

    }

  }


  return (

    <AppShell activeTab="settings">

      <div className="p-6">

        <h1 className="text-2xl font-bold">

          LinkedIn Accounts

        </h1>

        <p className="text-gray-600 mt-2">

          Connect your LinkedIn accounts.

        </p>


        {/* ADD BUTTON */}

        <button
          onClick={() => setShowAdd(true)}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
        >

          Add LinkedIn Account

        </button>


        {/* ACCOUNT LIST */}

        <div className="mt-6 space-y-4">

          {loading && (

            <p>Loading...</p>

          )}

          {!loading &&
            accounts.length === 0 && (

              <p className="text-gray-500">

                No LinkedIn accounts yet.

              </p>

          )}

          {accounts.map((acc) => (

            <div
              key={acc.id}
              className="border p-4 rounded-lg flex justify-between"
            >

              <div>

                <p className="font-medium">

                  {acc.name}

                </p>

                <p className="text-sm text-gray-500">

                  {acc.profileUrl}

                </p>

              </div>

              <div>

                Daily Limit:

                {acc.dailyLimit}

              </div>

            </div>

          ))}

        </div>


        {/* ADD MODAL */}

        {showAdd && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

            <div className="bg-white p-6 rounded-lg w-96">

              <h2 className="text-lg font-semibold">

                Add LinkedIn Account

              </h2>

              <input
                placeholder="Account Name"
                className="w-full border p-2 mt-3 rounded"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              <input
                placeholder="Profile URL"
                className="w-full border p-2 mt-3 rounded"
                value={profileUrl}
                onChange={(e) =>
                  setProfileUrl(e.target.value)
                }
              />

              <div className="flex justify-end gap-2 mt-4">

                <button
                  onClick={() =>
                    setShowAdd(false)
                  }
                  className="px-4 py-2 border rounded"
                >

                  Cancel

                </button>

                <button
                  onClick={addAccount}
                  className="px-4 py-2 bg-purple-600 text-white rounded"
                >

                  Save

                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </AppShell>

  )

}