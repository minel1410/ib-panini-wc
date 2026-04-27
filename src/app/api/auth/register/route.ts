import { NextRequest, NextResponse } from 'next/server';
import { randomUUID, createHash } from 'crypto';
import { db } from '@/lib/db';

function hash(pw: string) {
  return createHash('sha256').update(pw).digest('hex');
}

export async function POST(req: NextRequest) {
  const { name, password } = (await req.json()) as { name?: string; password?: string };

  if (!name?.trim()) return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  if (!password?.trim()) return NextResponse.json({ error: 'Password is required' }, { status: 400 });
  if (password.trim().length < 4) return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });

  const trimmed = name.trim();

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE name = ?',
    args: [trimmed],
  });

  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const id = randomUUID();
  const pw = hash(password.trim());
  await db.execute({
    sql: 'INSERT INTO users (id, name, password_hash) VALUES (?, ?, ?)',
    args: [id, trimmed, pw],
  });

  return NextResponse.json({ id, name: trimmed });
}
