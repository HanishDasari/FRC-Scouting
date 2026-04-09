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
        `INSERT INTO matches ("matchNumber", teams) VALUES ($1, $2)
         ON DUPLICATE KEY UPDATE teams = VALUES(teams)`,
        [matchNumber, teams]
      );
      return NextResponse.json({ success: true });
    }

    if (body.type === 'EDIT_MATCH') {
      const oldMatchNumber = parseInt(body.oldMatchNumber, 10);
      const newMatchNumber = parseInt(body.newMatchNumber, 10);
      const teams = body.teams.map((t: any) => t.toString()).join(',');
      
      // Update match number and teams
      // If matchNumber changed, we might need to update reports and drafts too!
      await query(
        `UPDATE matches SET "matchNumber" = $1, teams = $2 WHERE "matchNumber" = $3`,
        [newMatchNumber, teams, oldMatchNumber]
      );
      
      if (oldMatchNumber !== newMatchNumber) {
        await query(`UPDATE reports SET "matchNumber" = $1 WHERE "matchNumber" = $2`, [newMatchNumber, oldMatchNumber]);
        await query(`UPDATE drafts SET "matchNumber" = $1 WHERE "matchNumber" = $2`, [newMatchNumber, oldMatchNumber]);
      }
      return NextResponse.json({ success: true });
    }

    const r: any = {
      id: body.id,
      status: body.status || 'IN_PROGRESS',
      scouterName: body.scouterName || '',
      teamNumber: parseInt(body.teamNumber, 10) || 0,
      matchNumber: parseInt(body.matchNumber, 10) || 0,
      gameStrategy: body.gameStrategy || '',
      drivetrainType: body.drivetrainType || '',
      robotWeight: body.robotWeight || '',
      scoringRange: body.scoringRange || '',
      storageCapacity: body.storageCapacity || '',
      outtakeType: body.outtakeType || '',
      driverExperience: body.driverExperience || '',
      autoDescription: body.autoDescription || '',
      autoStartPositions: body.autoStartPositions || '',
      autoAccuracy: body.autoAccuracy || '',
      hasHang: !!body.hasHang,
      shootingAccuracy: body.shootingAccuracy || '',
      cycleTime: body.cycleTime || '',
      intakeType: body.intakeType || '',
      avgFuelScored: body.avgFuelScored || '',
      hasVision: !!body.hasVision,
      hasMajorIssues: !!body.hasMajorIssues,
      commonIssue: body.commonIssue || '',
    };

    if (r.status === 'IN_PROGRESS') {
      await query(`
        INSERT INTO drafts (id, status, "scouterName", "teamNumber", "matchNumber", "gameStrategy", "drivetrainType",
          "robotWeight", "scoringRange", "storageCapacity", "outtakeType", "driverExperience", "autoDescription",
          "autoStartPositions", "autoAccuracy", "hasHang", "shootingAccuracy", "cycleTime", "intakeType",
          "avgFuelScored", "hasVision", "hasMajorIssues", "commonIssue", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
        ON DUPLICATE KEY UPDATE
          status=$2, "scouterName"=$3, "teamNumber"=$4, "matchNumber"=$5, "gameStrategy"=$6, "drivetrainType"=$7,
          "robotWeight"=$8, "scoringRange"=$9, "storageCapacity"=$10, "outtakeType"=$11, "driverExperience"=$12,
          "autoDescription"=$13, "autoStartPositions"=$14, "autoAccuracy"=$15, "hasHang"=$16, "shootingAccuracy"=$17,
          "cycleTime"=$18, "intakeType"=$19, "avgFuelScored"=$20, "hasVision"=$21, "hasMajorIssues"=$22,
          "commonIssue"=$23, "updatedAt"=$24`,
        [r.id, 'IN_PROGRESS', r.scouterName, r.teamNumber, r.matchNumber, r.gameStrategy, r.drivetrainType,
         r.robotWeight, r.scoringRange, r.storageCapacity, r.outtakeType, r.driverExperience, r.autoDescription,
         r.autoStartPositions, r.autoAccuracy, r.hasHang, r.shootingAccuracy, r.cycleTime, r.intakeType,
         r.avgFuelScored, r.hasVision, r.hasMajorIssues, r.commonIssue, new Date().toISOString()]
      );
    } else {
      await query(`
        INSERT INTO reports (id, status, "scouterName", "teamNumber", "matchNumber", "gameStrategy", "drivetrainType",
          "robotWeight", "scoringRange", "storageCapacity", "outtakeType", "driverExperience", "autoDescription",
          "autoStartPositions", "autoAccuracy", "hasHang", "shootingAccuracy", "cycleTime", "intakeType",
          "avgFuelScored", "hasVision", "hasMajorIssues", "commonIssue", "createdAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
        ON DUPLICATE KEY UPDATE
          status=$2, "scouterName"=$3, "teamNumber"=$4, "matchNumber"=$5, "gameStrategy"=$6, "drivetrainType"=$7,
          "robotWeight"=$8, "scoringRange"=$9, "storageCapacity"=$10, "outtakeType"=$11, "driverExperience"=$12,
          "autoDescription"=$13, "autoStartPositions"=$14, "autoAccuracy"=$15, "hasHang"=$16, "shootingAccuracy"=$17,
          "cycleTime"=$18, "intakeType"=$19, "avgFuelScored"=$20, "hasVision"=$21, "hasMajorIssues"=$22,
          "commonIssue"=$23, "createdAt"=$24`,
        [r.id, 'COMPLETED', r.scouterName, r.teamNumber, r.matchNumber, r.gameStrategy, r.drivetrainType,
         r.robotWeight, r.scoringRange, r.storageCapacity, r.outtakeType, r.driverExperience, r.autoDescription,
         r.autoStartPositions, r.autoAccuracy, r.hasHang, r.shootingAccuracy, r.cycleTime, r.intakeType,
         r.avgFuelScored, r.hasVision, r.hasMajorIssues, r.commonIssue, new Date().toISOString()]
      );
      await query('DELETE FROM drafts WHERE id = $1', [r.id]);
    }

    return NextResponse.json({ success: true }, { status: 201 });
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
    const deleteAll = searchParams.get('deleteAll');

    if (deleteAll === 'true') {
      await query('DELETE FROM matches');
      return NextResponse.json({ success: true });
    }
    if (id) {
      await query('DELETE FROM reports WHERE id = $1', [id]);
      await query('DELETE FROM drafts WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    }
    if (matchNumber) {
      await query('DELETE FROM matches WHERE "matchNumber" = $1', [parseInt(matchNumber, 10)]);
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
    const [reportsRes, draftsRes, matchesRes] = await Promise.all([
      query('SELECT * FROM reports ORDER BY "createdAt" DESC'),
      query('SELECT * FROM drafts ORDER BY "updatedAt" DESC'),
      query('SELECT * FROM matches ORDER BY "matchNumber" ASC'),
    ]);

    const matches = (matchesRes.rows || []).map((row: any) => ({
      matchNumber: row.matchNumber ?? row.matchnumber,
      teams: (row.teams || '').split(',').map((t: string) => parseInt(t, 10))
    }));

    return NextResponse.json({
      reports: [...(reportsRes.rows || []), ...(draftsRes.rows || [])],
      matches
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
