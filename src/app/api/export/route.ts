import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const rawReports = await (await db.prepare('SELECT * FROM reports ORDER BY createdAt DESC')).all();

        if (rawReports.length === 0) {
            return NextResponse.json({ error: 'No data to export' }, { status: 404 });
        }

        // Define headers based on the schema
        const headers = [
            'ID', 'Status', 'Our Team #', 'Match #', 'Team #',
            'Strategy', 'Drive Train', 'Weight', 'Scoring Range',
            'Storage', 'Outtake', 'Driver Exp', 'Auto Caps',
            'Auto Positions', 'Auto Accuracy', 'Hang', 'Shooting Accuracy',
            'Cycle Time', 'Intake', 'Avg Fuel', 'Vision', 'Major Issues', 'Common Issue',
            'Timestamp'
        ];

        // Convert rows to CSV format
        const rows = rawReports.map(r => [
            r.id, r.status, r.ourTeamNumber, r.matchNumber, r.teamNumber,
            `"${(r.gameStrategy || '').replace(/"/g, '""')}"`,
            r.driveTrain, r.robotWeight, r.scoringRange,
            r.storageCapacity, r.outtakeType, r.driverExperience,
            `"${(r.autonomousCapabilities || '').replace(/"/g, '""')}"`,
            r.autoStartPositions, r.autoAccuracy, r.hasHang, r.shootingAccuracy,
            r.cycleTime, r.intakeType, r.avgFuelScored, r.hasVision,
            `"${(r.majorIssues || '').replace(/"/g, '""')}"`,
            `"${(r.commonIssue || '').replace(/"/g, '""')}"`,
            r.createdAt
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

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
