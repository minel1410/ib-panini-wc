import { NextRequest, NextResponse } from 'next/server';
import { randomUUID, createHash } from 'crypto';
import { db } from '@/lib/db';

function hash(pw: string) {
  return createHash('sha256').update(pw).digest('hex');
}

export async function GET() {
  const result = await db.execute('SELECT id, name FROM users ORDER BY name ASC');
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { name, password } = (await req.json()) as { name?: string; password?: string };

  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  if (!password?.trim()) return NextResponse.json({ error: 'Password required' }, { status: 400 });

  const trimmed = name.trim();
  const pw = hash(password.trim());

  const existing = await db.execute({
    sql: 'SELECT id, name, password_hash FROM users WHERE name = ?',
    args: [trimmed],
  });

  if (existing.rows.length === 0) {
    const id = randomUUID();
    await db.execute({ sql: 'INSERT INTO users (id, name, password_hash) VALUES (?, ?, ?)', args: [id, trimmed, pw] });
    return NextResponse.json({ id, name: trimmed });
  }

  const row = existing.rows[0];

  if (!row.password_hash) {
    await db.execute({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [pw, row.id] });
    return NextResponse.json({ id: row.id, name: row.name });
  }

  if (row.password_hash !== pw) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  return NextResponse.json({ id: row.id, name: row.name });
}
