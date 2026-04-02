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
      'ID', 'Status', 'Scouter', 'Team Number', 'Qual Number',
      'Strategy', 'Drivetrain', 'Robot Weight', 'Scoring Range',
      'Storage Capacity', 'Outtake Type', 'Driver Experience', 'Auto Description',
      'Auto Start Pos', 'Auto Accuracy', 'Hanging (Yes/No)', 'Shooting Accuracy',
      'Cycle Time', 'Intake Type', 'Avg Fuel Scored', 'Has Vision', 'Major Issues', 'Common Issue',
      'Submission Time'
    ];

    const rows = rawReports.map((r: any) => {
      const row = [
        r.id, r.status, r.scouterName, r.teamNumber, r.matchNumber,
        `"${(r.gameStrategy || '').replace(/"/g, '""')}"`,
        r.drivetrainType, r.robotWeight, r.scoringRange,
        r.storageCapacity, r.outtakeType, r.driverExperience,
        `"${(r.autoDescription || '').replace(/"/g, '""')}"`,
        r.autoStartPositions, r.autoAccuracy, 
        r.hasHang ? 'Yes' : 'No', 
        r.shootingAccuracy,
        r.cycleTime, r.intakeType, r.avgFuelScored, 
        r.hasVision ? 'Yes' : 'No',
        r.hasMajorIssues ? 'Yes' : 'No',
        `"${(r.commonIssue || '').replace(/"/g, '""')}"`,
        r.createdAt
      ];
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

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
