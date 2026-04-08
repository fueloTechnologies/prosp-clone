// src/lib/enrichment.ts

export interface EnrichmentResult {
  source: string
  email?: string | null
  phone?: string | null
  found: boolean
  verified?: boolean
}

export interface EnrichmentData {
  results: EnrichmentResult[]
  bestEmail: string | null
  bestPhone: string | null
}

// Prospeo enrichment
async function enrichWithProspeo(
  firstName: string,
  lastName: string,
  company: string
): Promise<EnrichmentResult> {
  const apiKey = process.env.PROSPEO_API_KEY
  if (!apiKey) {
    return { source: 'Prospeo', found: false }
  }

  try {
    const response = await fetch('https://api.prospeo.io/email-finder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KEY': apiKey,
      },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, company }),
    })
    const data = await response.json()
    if (data.response?.email) {
      return {
        source: 'Prospeo',
        email: data.response.email,
        found: true,
        verified: data.response.verification?.status === 'VALID',
      }
    }
    return { source: 'Prospeo', found: false }
  } catch {
    return { source: 'Prospeo', found: false }
  }
}

// Dropcontact enrichment
async function enrichWithDropcontact(
  firstName: string,
  lastName: string,
  company: string
): Promise<EnrichmentResult> {
  const apiKey = process.env.DROPCONTACT_API_KEY
  if (!apiKey) {
    return { source: 'Dropcontact', found: false }
  }

  try {
    const response = await fetch('https://api.dropcontact.com/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': apiKey,
      },
      body: JSON.stringify({
        data: [{ first_name: firstName, last_name: lastName, company }],
        siren: false,
        language: 'en',
      }),
    })
    const data = await response.json()
    const contact = data.data?.[0]
    if (contact?.email?.[0]?.email) {
      return {
        source: 'Dropcontact',
        email: contact.email[0].email,
        found: true,
        verified: contact.email[0].qualification === 'verified',
      }
    }
    return { source: 'Dropcontact', found: false }
  } catch {
    return { source: 'Dropcontact', found: false }
  }
}

// Findymail enrichment
async function enrichWithFindymail(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EnrichmentResult> {
  const apiKey = process.env.FINDYMAIL_API_KEY
  if (!apiKey) {
    return { source: 'Findymail', found: false }
  }

  try {
    const response = await fetch('https://app.findymail.com/api/search/name', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: `${firstName} ${lastName}`, domain }),
    })
    const data = await response.json()
    if (data.contact?.email) {
      return {
        source: 'Findymail',
        email: data.contact.email,
        phone: data.contact.phone || null,
        found: true,
        verified: true,
      }
    }
    return { source: 'Findymail', found: false }
  } catch {
    return { source: 'Findymail', found: false }
  }
}

// Datagma enrichment
async function enrichWithDatagma(
  firstName: string,
  lastName: string,
  company: string
): Promise<EnrichmentResult> {
  const apiKey = process.env.DATAGMA_API_KEY
  if (!apiKey) {
    return { source: 'Datagma', found: false }
  }

  try {
    const response = await fetch(
      `https://gateway.datagma.net/api/ingress/v2/find?apiId=${apiKey}&fullName=${firstName}+${lastName}&companyName=${company}`,
      { method: 'GET' }
    )
    const data = await response.json()
    if (data.person?.email) {
      return {
        source: 'Datagma',
        email: data.person.email,
        found: true,
        verified: false,
      }
    }
    return { source: 'Datagma', found: false }
  } catch {
    return { source: 'Datagma', found: false }
  }
}

// Main enrichment function - runs all sources in parallel
export async function enrichContact(
  firstName: string,
  lastName: string,
  company: string,
  email?: string
): Promise<EnrichmentData> {
  const domain = email?.split('@')[1] || company.toLowerCase().replace(/\s+/g, '') + '.com'

  const [prospeo, dropcontact, findymail, datagma] = await Promise.allSettled([
    enrichWithProspeo(firstName, lastName, company),
    enrichWithDropcontact(firstName, lastName, company),
    enrichWithFindymail(firstName, lastName, domain),
    enrichWithDatagma(firstName, lastName, company),
  ])

  const results: EnrichmentResult[] = [
    prospeo.status === 'fulfilled' ? prospeo.value : { source: 'Prospeo', found: false },
    dropcontact.status === 'fulfilled' ? dropcontact.value : { source: 'Dropcontact', found: false },
    findymail.status === 'fulfilled' ? findymail.value : { source: 'Findymail', found: false },
    datagma.status === 'fulfilled' ? datagma.value : { source: 'Datagma', found: false },
  ]

  // Pick best email (prefer verified)
  const bestEmail =
    results.find((r) => r.found && r.verified)?.email ||
    results.find((r) => r.found)?.email ||
    null

  const bestPhone = results.find((r) => r.phone)?.phone || null

  return { results, bestEmail, bestPhone }
}
