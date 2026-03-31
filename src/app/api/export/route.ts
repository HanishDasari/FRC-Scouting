import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDB(); initialized = true; }
}

export async function GET(req: Request) {
  try {
    await ensureInit();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'prescout';

    if (type === 'live') {
      const result = await query('SELECT * FROM live_reports ORDER BY "matchNumber" ASC, "teamNumber" ASC');
      const data = result.rows;

      if (data.length === 0) {
        return NextResponse.json({ error: 'No live data to export' }, { status: 404 });
      }

      const headers = [
        'ID', 'Scouter Name', 'Team Number', 'Match Number',
        'Auton Cycles', 'Teleop Cycles', 'Successful Hang?', 'Observational Notes', 'Timestamp'
      ];

      const rows = data.map((r: any) => [
        r.id, 
        `"${(r.scouterName || '').replace(/"/g, '""')}"`,
        r.teamNumber, 
        r.matchNumber,
        r.autonScored, 
        r.scored,
        r.hasHang ? 'Yes' : 'No',
        `"${(r.comments || '').replace(/"/g, '""')}"`,
        r.createdAt
      ]);

      const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=6905_live_scouting_${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    } else {
      // Default: prescout
      const result = await query('SELECT * FROM reports ORDER BY "matchNumber" ASC, "teamNumber" ASC');
      const data = result.rows;

      if (data.length === 0) {
        return NextResponse.json({ error: 'No prescout data to export' }, { status: 404 });
      }

      const headers = [
        'ID', 'Status', 'Scouter Identity', 'Team Identifier', 'Qualification',
        'Primary Role', 'Drive System', 'Operational Weight', 'Scoring Distance',
        'Storage Capacity', 'Mechanism / Outtake', 'Experience Level', 'Intake Source',
        'Routine Description', 'Origin Positions', 'Execution Accuracy', 
        'Integrated Climber?', 'Shot Precision', 'Cycle Rhythm', 
        'Average Scoring', 'Optical Processing?', 
        'Critical Instability?', 'Identified Failures',
        'Timestamp'
      ];

      const rows = data.map((r: any) => [
        r.id, r.status, 
        `"${(r.scouterName || '').replace(/"/g, '""')}"`,
        r.teamNumber, r.matchNumber,
        `"${(r.gameStrategy || '').replace(/"/g, '""')}"`,
        r.drivetrainType, r.robotWeight, r.scoringRange,
        r.storageCapacity, r.outtakeType, r.driverExperience, r.intakeType,
        `"${(r.autoDescription || '').replace(/"/g, '""')}"`,
        r.autoStartPositions, r.autoAccuracy, 
        r.hasHang ? 'Yes' : 'No', r.shootingAccuracy,
        r.cycleTime, r.avgFuelScored, 
        r.hasVision ? 'Yes' : 'No',
        r.hasMajorIssues ? 'Yes' : 'No',
        `"${(r.commonIssue || '').replace(/"/g, '""')}"`,
        r.createdAt
      ]);

      const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=6905_prescouting_${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    }
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
