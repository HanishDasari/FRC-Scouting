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

    // Helper to find value regardless of casing
    const getVal = (report: any, key: string) => {
      if (!report) return undefined;
      if (report[key] !== undefined) return report[key];
      const lowerKey = key.toLowerCase();
      const realKey = Object.keys(report).find(k => k.toLowerCase() === lowerKey);
      return realKey ? report[realKey] : undefined;
    };

    const rows = rawReports.map((r: any) => {
      const row = [
        getVal(r, 'id'), 
        getVal(r, 'status'), 
        getVal(r, 'scouterName'), 
        getVal(r, 'teamNumber'), 
        getVal(r, 'matchNumber'),
        `"${(getVal(r, 'gameStrategy') || '').replace(/"/g, '""')}"`,
        getVal(r, 'drivetrainType'), 
        getVal(r, 'robotWeight'), 
        getVal(r, 'scoringRange'),
        getVal(r, 'storageCapacity'), 
        getVal(r, 'outtakeType'), 
        getVal(r, 'driverExperience'),
        `"${(getVal(r, 'autoDescription') || '').replace(/"/g, '""')}"`,
        getVal(r, 'autoStartPositions'), 
        getVal(r, 'autoAccuracy'), 
        getVal(r, 'hasHang') ? 'Yes' : 'No', 
        getVal(r, 'shootingAccuracy'),
        getVal(r, 'cycleTime'), 
        getVal(r, 'intakeType'), 
        getVal(r, 'avgFuelScored'), 
        getVal(r, 'hasVision') ? 'Yes' : 'No',
        getVal(r, 'hasMajorIssues') ? 'Yes' : 'No',
        `"${(getVal(r, 'commonIssue') || '').replace(/"/g, '""')}"`,
        getVal(r, 'createdAt')
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
