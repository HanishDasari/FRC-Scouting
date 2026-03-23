# 6905 Scouting - Raiders of the Arc
FRC Scouting platform for Team 6905, tailored for the 2026 Rebuilt game at Albany. Built specifically for the Drive Team and Strategy Lead.

## Features
- **Match Setup**: Easily configure a 6-team match roster to track Red and Blue alliances for an upcoming match.
- **Scout Intel Entry**: A highly responsive, single-page scouting form built for speed. Currently tracks 19 critical FRC data points across Robot Profile, Autonomous, Teleop, and Hardware Reliability.
- **Live Status Dashboard**: A dynamically updating dashboard (synchronizes every 5 seconds) to view real-time scouting progression ("Dormant", "Active", "Secured"). Instantly pull up and filter teams by their number via the live search bar regardless of whether they have been scouted yet.
- **Admin Portal**: An administrative area rigorously secured for authorized personnel to modify or remove matches. Re-assign teams or fix match numbers after creation without breaking any linked intelligence data.
- **Tactical Responsive Layout**: Specifically engineered UI built to look premium and readable on mobile devices (scouter's phones) and robust enough to handle the information density required on laptops (strategy team).
- **Offline CSV Generation**: Extract all intelligence directly to a .csv file directly from the browser for offline analysis.
- **Hybrid Intelligent Sandbox**: Connects to an external Postgres Database in production (e.g. Supabase, Render), but defaults seamlessly to an internal offline SQLite filesystem during local development so nothing stops your workflow.

## Technology Stack
- Next.js 15 (App Router)
- React 19 + TypeScript
- Database Drivers: `pg` (PostgreSQL) for Deployment, `better-sqlite3` for seamless local fallback
- Styling Engine: Tailwind CSS v4 
- Icons: Lucide React

## Getting Started

### Standard Usage (Local)

1. Ensure [Node.js](https://nodejs.org/) (v18+) is installed.
2. Clone this repository locally.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the command center locally:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:3000`. The app will automatically initialize and connect to a local `local.db` file so no Postgres configuration is required!

### Administrative Access
If entering the `/admin` portal on localhost, the default developer credentials are:
- **Username:** `Raiders6905Admin`
- **Password:** `Str@tegy$cout!2026`

*(These can be safely overwritten in production via environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD`)*

### Production Deployment
When deploying to a cloud host (like Render or Vercel), the application will use the provided `DATABASE_URL` environment variable to connect to a PostgreSQL database. Remember to initialize the deployed environment variables to fully secure the admin system and point the app to your cloud DB! 