import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST: Save a scouting report or update match configuration
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Check if we are updating the current match roster
    if (body.type === 'SET_MATCH') {
      const matchNumber = parseInt(body.matchNumber, 10);
      const teams = body.teams.map((t: any) => t.toString()).join(',');
      db.prepare('INSERT OR REPLACE INTO matches (id, matchNumber, teams) VALUES (1, ?, ?)').run(matchNumber, teams);
      return NextResponse.json({ success: true });
    }

    // Handle Scouting Report (Draft or Final)
    const record = {
      id: body.id,
      status: body.status || 'IN_PROGRESS',
      scouterName: body.scouterName || '',
      matchNumber: parseInt(body.matchNumber, 10) || 0,
      teamNumber: parseInt(body.teamNumber, 10) || 0,
      autoL1: parseInt(body.autoL1, 10) || 0,
      autoL2: parseInt(body.autoL2, 10) || 0,
      autoL3: parseInt(body.autoL3, 10) || 0,
      autoMiss: parseInt(body.autoMiss, 10) || 0,
      leaveLine: body.leaveLine ? 1 : 0,
      teleopL1: parseInt(body.teleopL1, 10) || 0,
      teleopL2: parseInt(body.teleopL2, 10) || 0,
      teleopL3: parseInt(body.teleopL3, 10) || 0,
      teleopMiss: parseInt(body.teleopMiss, 10) || 0,
      cycleSpeed: body.cycleSpeed || 'AVERAGE',
      driverSkill: parseInt(body.driverSkill, 10) || 3,
      defense: parseInt(body.defense, 10) || 3,
      climbStatus: body.climbStatus || 'NONE',
      notes: body.notes || ''
    };

    if (record.status === 'IN_PROGRESS') {
      db.prepare(`
        INSERT OR REPLACE INTO drafts (
          id, status, scouterName, matchNumber, teamNumber, autoL1, autoL2, autoL3, autoMiss, leaveLine,
          teleopL1, teleopL2, teleopL3, teleopMiss, cycleSpeed, driverSkill, defense, climbStatus, notes, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        record.id, 'IN_PROGRESS', record.scouterName, record.matchNumber, record.teamNumber,
        record.autoL1, record.autoL2, record.autoL3, record.autoMiss, record.leaveLine,
        record.teleopL1, record.teleopL2, record.teleopL3, record.teleopMiss,
        record.cycleSpeed, record.driverSkill, record.defense, record.climbStatus, record.notes,
        new Date().toISOString()
      );
    } else {
      db.prepare(`
        INSERT OR REPLACE INTO reports (
          id, status, scouterName, matchNumber, teamNumber, autoL1, autoL2, autoL3, autoMiss, leaveLine,
          teleopL1, teleopL2, teleopL3, teleopMiss, cycleSpeed, driverSkill, defense, climbStatus, notes, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        record.id, 'COMPLETED', record.scouterName, record.matchNumber, record.teamNumber,
        record.autoL1, record.autoL2, record.autoL3, record.autoMiss, record.leaveLine,
        record.teleopL1, record.teleopL2, record.teleopL3, record.teleopMiss,
        record.cycleSpeed, record.driverSkill, record.defense, record.climbStatus, record.notes,
        new Date().toISOString()
      );
      db.prepare('DELETE FROM drafts WHERE id = ?').run(record.id);
    }
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in API POST:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rawReports = db.prepare('SELECT * FROM reports ORDER BY createdAt DESC').all();
    const rawDrafts = db.prepare('SELECT * FROM drafts').all();
    const matchRow: any = db.prepare('SELECT * FROM matches WHERE id = 1').get();
    
    const currentMatch = matchRow ? {
      matchNumber: matchRow.matchNumber,
      teams: matchRow.teams.split(',').map((t: string) => parseInt(t, 10))
    } : { matchNumber: 0, teams: [] };

    const mapRecord = (r: any) => ({
      ...r,
      leaveLine: r.leaveLine === 1,
      matchNumber: parseInt(r.matchNumber, 10),
      teamNumber: parseInt(r.teamNumber, 10)
    });
    
    return NextResponse.json({ 
      reports: [
        ...rawReports.map(mapRecord),
        ...rawDrafts.map(mapRecord)
      ], 
      currentMatch 
    });
  } catch (error) {
    console.error('Error in API GET:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
