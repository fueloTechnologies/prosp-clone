'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'



export default function InboxPage() {

  const [conversations, setConversations] =
    useState<any[]>([])

  const [selected, setSelected] =
    useState<any>(null)



  /* =========================
     LOAD + AUTO REFRESH
  ========================= */

  useEffect(() => {

    const loadInbox = async () => {

      try {

        const res =
          await fetch('/api/inbox')

        const data =
          await res.json()



        setConversations(data)



        /* Keep selected synced */

        if (selected) {

          const updated =
            data.find(
              (c: any) =>
                c.id === selected.id
            )

          if (updated) {
            setSelected(updated)
          }

        }

        else if (data.length > 0) {

          setSelected(data[0])

        }

      }

      catch (error) {

        console.error(
          'Inbox load failed:',
          error
        )

      }

    }



    /* Initial load */

    loadInbox()



    /* Auto refresh every 5 seconds */

    const interval =
      setInterval(
        loadInbox,
        5000
      )



    return () =>
      clearInterval(interval)



  }, [selected])



  /* =========================
     SELECT CONVERSATION
     + MARK AS READ
  ========================= */

  const handleSelect = async (conv: any) => {

    setSelected(conv)

    try {

      await fetch(
        `/api/conversations/${conv.id}/read`,
        { method: 'POST' }
      )



      /* Update UI instantly */

      setConversations(prev =>
        prev.map(c =>
          c.id === conv.id
            ? { ...c, unreadCount: 0 }
            : c
        )
      )

    }

    catch (error) {

      console.error(
        'Mark read failed:',
        error
      )

    }

  }



  return (

    <AppShell activeTab="inbox">

      <div className="flex h-full">

        {/* =========================
           LEFT PANEL
        ========================= */}

        <div className="w-80 border-r overflow-y-auto">

          {conversations.map(conv => (

            <div
              key={conv.id}

              onClick={() =>
                handleSelect(conv)
              }

              className="p-4 border-b cursor-pointer hover:bg-gray-50"
            >

              {/* NAME + UNREAD */}

              <div className="font-medium flex justify-between items-center">

                <span>

                  {conv.contact?.firstName || 'Unknown'}{' '}

                  {conv.contact?.lastName || 'Contact'}

                </span>



                {conv.unreadCount > 0 && (

                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">

                    {conv.unreadCount}

                  </span>

                )}

              </div>



              {/* MESSAGE COUNT */}

              <div className="text-sm text-gray-500">

                {conv.messages?.length || 0} messages

              </div>

            </div>

          ))}

        </div>



        {/* =========================
           RIGHT PANEL
        ========================= */}

        <div className="flex-1 overflow-y-auto p-6">

          {selected ? (

            selected.messages?.map((msg: any) => (

              <div
                key={msg.id}
                className="mb-4"
              >

                {/* META */}

                <div className="text-xs text-gray-400">

                  {msg.direction} •{' '}

                  {msg.sentAt
                    ? new Date(msg.sentAt).toLocaleString()
                    : ''
                  }

                </div>



                {/* MESSAGE */}

                <div className="p-3 rounded-lg bg-gray-100">

                  {msg.content}

                </div>

              </div>

            ))

          ) : (

            <div className="text-gray-400">

              No messages yet

            </div>

          )}

        </div>

      </div>

    </AppShell>

  )

}