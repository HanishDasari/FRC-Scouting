import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDB(); initialized = true; }
}

export async function GET() {
  try {
    await ensureInit();
    const result = await query('SELECT * FROM reports ORDER BY "createdAt" DESC');
    const rawReports = result.rows;

    if (rawReports.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 });
    }

    const headers = [
      'ID', 'Status', 'Scouter', 'Team #', 'Match #',
      'Strategy', 'Drive Train', 'Weight', 'Scoring Range',
      'Storage', 'Outtake', 'Driver Exp', 'Auto Description',
      'Auto Positions', 'Auto Accuracy', 'Hang', 'Shooting Accuracy',
      'Cycle Time', 'Intake', 'Avg Fuel', 'Vision', 'Major Issues', 'Common Issue',
      'Timestamp'
    ];

    const rows = rawReports.map((r: any) => [
      r.id, r.status, r.scouterName, r.teamNumber, r.matchNumber,
      `"${(r.gameStrategy || '').replace(/"/g, '""')}"`,
      r.drivetrainType, r.robotWeight, r.scoringRange,
      r.storageCapacity, r.outtakeType, r.driverExperience,
      `"${(r.autoDescription || '').replace(/"/g, '""')}"`,
      r.autoStartPositions, r.autoAccuracy, r.hasHang, r.shootingAccuracy,
      r.cycleTime, r.intakeType, r.avgFuelScored, r.hasVision,
      r.hasMajorIssues,
      `"${(r.commonIssue || '').replace(/"/g, '""')}"`,
      r.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=frc_scouting_data.csv'
      }
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
