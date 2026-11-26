import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'techbozor_db.json');

function readDb(): any {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function writeDb(db: any) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tgId = searchParams.get('tgId');
  if (!tgId) {
    return NextResponse.json({ success: false, phone: null, region: null });
  }
  const db = readDb();
  const user = db.tgUsers?.[String(tgId)];
  return NextResponse.json({
    success: true,
    phone: user?.phone || null,
    region: user?.region || null,
    username: user?.username || null,
    firstName: user?.firstName || null,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tgId = String(body.tgId || '').trim();
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const region = body.region ? String(body.region).trim() : undefined;

    if (!tgId || (!phone && !region)) {
      return NextResponse.json({ success: false, error: 'tgId va phone yoki region talab qilinadi' }, { status: 400 });
    }
    const db = readDb();
    if (!db.tgUsers) db.tgUsers = {};
    db.tgUsers[tgId] = {
      ...(db.tgUsers[tgId] || {}),
      tgId,
      ...(phone ? { phone } : {}),
      ...(region ? { region } : {}),
      username: body.username || db.tgUsers[tgId]?.username || '',
      firstName: body.firstName || db.tgUsers[tgId]?.firstName || '',
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return NextResponse.json({
      success: true,
      phone: db.tgUsers[tgId].phone || null,
      region: db.tgUsers[tgId].region || null,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
