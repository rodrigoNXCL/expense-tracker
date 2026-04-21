// src/app/api/user/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}