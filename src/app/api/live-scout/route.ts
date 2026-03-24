import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDB(); initialized = true; }
}

export async function POST(req: Request) {
  try {
    await ensureInit();
    const body = await req.json();

    if (body.type === 'SET_MATCH') {
      const matchNumber = parseInt(body.matchNumber, 10);
      const teams = body.teams.map((t: any) => t.toString()).join(',');
      await query(
        `INSERT INTO live_matches ("matchNumber", "time", "qualRound", teams) VALUES ($1, $2, $3, $4)
         ON CONFLICT ("matchNumber") DO UPDATE SET "time" = EXCLUDED."time", "qualRound" = EXCLUDED."qualRound", teams = EXCLUDED.teams`,
        [matchNumber, body.time || '', body.qualRound || '', teams]
      );
      return NextResponse.json({ success: true });
    }

    if (body.type === 'EDIT_MATCH') {
      const oldMatchNumber = parseInt(body.oldMatchNumber, 10);
      const newMatchNumber = parseInt(body.newMatchNumber, 10);
      const teams = body.teams.map((t: any) => t.toString()).join(',');
      
      await query(
        `UPDATE live_matches SET "matchNumber" = $1, teams = $2 WHERE "matchNumber" = $3`,
        [newMatchNumber, teams, oldMatchNumber]
      );
      
      if (oldMatchNumber !== newMatchNumber) {
        await query(`UPDATE live_reports SET "matchNumber" = $1 WHERE "matchNumber" = $2`, [newMatchNumber, oldMatchNumber]);
      }
      return NextResponse.json({ success: true });
    }

    if (body.type === 'REPORT') {
      const r = {
        id: body.id,
        scouterName: body.scouterName || '',
        teamNumber: parseInt(body.teamNumber, 10) || 0,
        matchNumber: parseInt(body.matchNumber, 10) || 0,
        scored: parseInt(body.scored, 10) || 0,
        autonScored: parseInt(body.autonScored, 10) || 0,
        hasHang: !!body.hasHang,
        comments: body.comments || '',
      };

      await query(`
        INSERT INTO live_reports (id, "scouterName", "teamNumber", "matchNumber", scored, "autonScored", "hasHang", comments, "createdAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO UPDATE SET
          "scouterName"=EXCLUDED."scouterName", "teamNumber"=EXCLUDED."teamNumber", "matchNumber"=EXCLUDED."matchNumber", 
          scored=EXCLUDED.scored, "autonScored"=EXCLUDED."autonScored", "hasHang"=EXCLUDED."hasHang", 
          comments=EXCLUDED.comments, "createdAt"=EXCLUDED."createdAt"`,
        [r.id, r.scouterName, r.teamNumber, r.matchNumber, r.scored, r.autonScored, r.hasHang, r.comments, new Date().toISOString()]
      );

      return NextResponse.json({ success: true }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await ensureInit();
    const { searchParams } = new URL(req.url);
    const matchNumber = searchParams.get('matchNumber');
    const id = searchParams.get('id');

    if (id) {
      await query('DELETE FROM live_reports WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    }
    if (matchNumber) {
      await query('DELETE FROM live_matches WHERE "matchNumber" = $1', [parseInt(matchNumber, 10)]);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'ID or Match number required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureInit();
    const [reportsRes, matchesRes] = await Promise.all([
      query('SELECT * FROM live_reports ORDER BY "createdAt" DESC'),
      query('SELECT * FROM live_matches ORDER BY "matchNumber" ASC'),
    ]);

    const matches = matchesRes.rows.map((row: any) => ({
      matchNumber: row.matchNumber,
      time: row.time,
      qualRound: row.qualRound,
      teams: row.teams?.split(',').map((t: string) => parseInt(t, 10)) || []
    }));

    return NextResponse.json({
      reports: reportsRes.rows,
      matches
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
