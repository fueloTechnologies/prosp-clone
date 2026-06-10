// src/app/api/linkedin-accounts/verify/route.ts
// Verifies a li_at cookie is valid by checking LinkedIn's API
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { cookie } = await req.json();
  if (!cookie)
    return NextResponse.json({ valid: false, error: "No cookie provided" });

  try {
    // Hit LinkedIn's voyager API — returns 200 if cookie is valid, 401 if expired
    const res = await fetch("https://www.linkedin.com/voyager/api/me", {
      headers: {
        Cookie: `li_at=${cookie}`,
        "Csrf-Token": "ajax:0",
        "X-RestLi-Protocol-Version": "2.0.0",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (res.status === 200) {
      const data = await res.json();
      // Extract profile info from response
      const firstName = data?.miniProfile?.firstName || "";
      const lastName = data?.miniProfile?.lastName || "";
      const profileUrl = data?.miniProfile?.publicIdentifier
        ? `https://www.linkedin.com/in/${data.miniProfile.publicIdentifier}/`
        : "";
      const avatar =
        data?.miniProfile?.picture?.["com.linkedin.common.VectorImage"]
          ?.artifacts?.[0]?.fileIdentifyingUrlPathSegment || "";

      return NextResponse.json({
        valid: true,
        name: `${firstName} ${lastName}`.trim() || "LinkedIn User",
        profileUrl,
        avatar,
      });
    }

    return NextResponse.json({
      valid: false,
      error: "Cookie is expired or invalid",
    });
  } catch (err) {
    // If LinkedIn blocks the request from server, treat as unverifiable but allow save
    return NextResponse.json({
      valid: true,
      unverified: true,
      name: "LinkedIn User",
      profileUrl: "",
      avatar: "",
    });
  }
}
