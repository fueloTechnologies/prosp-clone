import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("LINKEDIN IMPORT:", body);

    /*
      NEXT STEP:
      CONNECT CHROME EXTENSION
    */

    return NextResponse.json({
      success: true,
      message: "Import started",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
