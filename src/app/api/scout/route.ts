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
      await (await db.prepare('INSERT OR REPLACE INTO matches (id, matchNumber, teams) VALUES (1, ?, ?)')).run(matchNumber, teams);
      return NextResponse.json({ success: true });
    }

    // NEW: Handle Match Reset (Clear grid only, keep completed reports)
    if (body.type === 'RESET_MATCH') {
      await (await db.prepare('DELETE FROM matches')).run();
      await (await db.prepare('DELETE FROM drafts')).run();
      // We do NOT delete from reports because the user wants them to be permanent.
      return NextResponse.json({ success: true });
    }

    // NEW: Handle Individual Team Removal from Grid
    if (body.type === 'DELETE_TEAM') {
      const teamNumber = parseInt(body.teamNumber, 10);
      // We ONLY delete drafts. COMPLETED reports stay in the database.
      await (await db.prepare('DELETE FROM drafts WHERE teamNumber = ?')).run(teamNumber);

      // Update the match roster string
      const matchRow: any = await (await db.prepare('SELECT * FROM matches WHERE id = 1')).get();
      if (matchRow) {
        const teams = matchRow.teams.split(',').filter((t: string) => t !== teamNumber.toString()).join(',');
        await (await db.prepare('UPDATE matches SET teams = ? WHERE id = 1')).run(teams);
      }
      return NextResponse.json({ success: true });
    }

    // Handle Scouting Report (Draft or Final)
    const record = {
      id: body.id,
      status: body.status || 'IN_PROGRESS',
      ourTeamNumber: body.ourTeamNumber || '',
      matchNumber: parseInt(body.matchNumber, 10) || 0,
      teamNumber: parseInt(body.teamNumber, 10) || 0,
      gameStrategy: body.gameStrategy || '',
      driveTrain: body.driveTrain || '',
      robotWeight: body.robotWeight || '',
      scoringRange: body.scoringRange || '',
      storageCapacity: body.storageCapacity || '',
      outtakeType: body.outtakeType || '',
      driverExperience: body.driverExperience || '',
      autonomousCapabilities: body.autonomousCapabilities || '',
      autoStartPositions: body.autoStartPositions || '',
      autoAccuracy: body.autoAccuracy || '',
      hasHang: body.hasHang || '',
      shootingAccuracy: body.shootingAccuracy || '',
      cycleTime: body.cycleTime || '',
      intakeType: body.intakeType || '',
      avgFuelScored: body.avgFuelScored || '',
      hasVision: body.hasVision || '',
      majorIssues: body.majorIssues || '',
      commonIssue: body.commonIssue || ''
    };

    if (record.status === 'IN_PROGRESS') {
      await (await db.prepare(`
        INSERT OR REPLACE INTO drafts (
          id, status, ourTeamNumber, matchNumber, teamNumber, gameStrategy, driveTrain, robotWeight, 
          scoringRange, storageCapacity, outtakeType, driverExperience, autonomousCapabilities, 
          autoStartPositions, autoAccuracy, hasHang, shootingAccuracy, cycleTime, intakeType, 
          avgFuelScored, hasVision, majorIssues, commonIssue, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)).run(
        record.id, 'IN_PROGRESS', record.ourTeamNumber, record.matchNumber, record.teamNumber,
        record.gameStrategy, record.driveTrain, record.robotWeight, record.scoringRange,
        record.storageCapacity, record.outtakeType, record.driverExperience,
        record.autonomousCapabilities, record.autoStartPositions, record.autoAccuracy,
        record.hasHang, record.shootingAccuracy, record.cycleTime, record.intakeType,
        record.avgFuelScored, record.hasVision, record.majorIssues, record.commonIssue,
        new Date().toISOString()
      );
    } else {
      await (await db.prepare(`
        INSERT OR REPLACE INTO reports (
          id, status, ourTeamNumber, matchNumber, teamNumber, gameStrategy, driveTrain, robotWeight, 
          scoringRange, storageCapacity, outtakeType, driverExperience, autonomousCapabilities, 
          autoStartPositions, autoAccuracy, hasHang, shootingAccuracy, cycleTime, intakeType, 
          avgFuelScored, hasVision, majorIssues, commonIssue, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)).run(
        record.id, 'COMPLETED', record.ourTeamNumber, record.matchNumber, record.teamNumber,
        record.gameStrategy, record.driveTrain, record.robotWeight, record.scoringRange,
        record.storageCapacity, record.outtakeType, record.driverExperience,
        record.autonomousCapabilities, record.autoStartPositions, record.autoAccuracy,
        record.hasHang, record.shootingAccuracy, record.cycleTime, record.intakeType,
        record.avgFuelScored, record.hasVision, record.majorIssues, record.commonIssue,
        new Date().toISOString()
      );
      await (await db.prepare('DELETE FROM drafts WHERE id = ?')).run(record.id);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in API POST:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rawReports = await (await db.prepare('SELECT * FROM reports ORDER BY createdAt DESC')).all();
    const rawDrafts = await (await db.prepare('SELECT * FROM drafts')).all();
    const matchRow: any = await (await db.prepare('SELECT * FROM matches WHERE id = 1')).get();

    const currentMatch = matchRow ? {
      matchNumber: matchRow.matchNumber,
      teams: matchRow.teams.split(',').filter((t: string) => t.length > 0).map((t: string) => parseInt(t, 10))
    } : { matchNumber: 0, teams: [] };

    const mapRecord = (r: any) => ({
      ...r,
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
