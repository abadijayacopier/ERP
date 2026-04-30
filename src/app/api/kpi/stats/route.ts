import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    // 1. Calculate Live PA/MA based on current fleet status distribution
    // In a real scenario, this would be based on hourly logs, 
    // but for the dashboard we aggregate current status
    const fleetStats: any = await query(`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM fleet_status 
      GROUP BY status
    `);

    const totalUnits = fleetStats.reduce((acc: number, curr: any) => acc + curr.count, 0);
    const running = fleetStats.find((s: any) => s.status === 'Running')?.count || 0;
    const standby = fleetStats.find((s: any) => s.status === 'Standby')?.count || 0;
    const breakdown = fleetStats.find((s: any) => s.status === 'Breakdown')?.count || 0;

    // Standard Mining Formulas
    const livePA = totalUnits > 0 ? ((running + standby) / totalUnits) * 100 : 0;
    const liveMA = (running + breakdown) > 0 ? (running / (running + breakdown)) * 100 : 0;
    const liveUA = (running + standby) > 0 ? (running / (running + standby)) * 100 : 0;

    // 2. Fetch Pareto Component Data (from maintenance descriptions)
    // We'll simulate a smart text search in the maintenance_jobs table
    const maintenanceData: any = await query(`
      SELECT description, COUNT(*) as frequency 
      FROM maintenance_jobs 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY description
      ORDER BY frequency DESC
      LIMIT 5
    `);

    // 3. Fetch Current Down Units (Data Down - Point 5)
    const downUnits: any = await query(`
      SELECT 
        fs.unit_id as code, 
        fs.model, 
        mj.description as problem,
        mj.created_at as since
      FROM fleet_status fs
      LEFT JOIN maintenance_jobs mj ON fs.unit_id = mj.unit_id AND mj.status != 'Completed'
      WHERE fs.status = 'Breakdown'
    `);

    // 4. Fetch Hierarchy (Point 10) - Now Component/Problem Hierarchy
    const hierarchy: any = await query(`
      SELECT component, component_section, sub_component, problem_description
      FROM component_hierarchy
      ORDER BY component, component_section, sub_component
    `);

    // 5. Fetch Mega Summary Fleet Data (Matching Excel Columns)
    const rawFleetData: any = await query(`
      SELECT 
        fs.unit_id as id,
        fs.model,
        COALESCE(dh.hm_start, fs.next_pm_hours - 500) as awal_bulan,
        fs.next_pm_hours as hm_running,
        (fs.next_pm_hours - COALESCE(dh.hm_start, fs.next_pm_hours - 500)) as work_hours,
        
        -- Stoppage/Delay Categories (The Pivot)
        COALESCE(SUM(CASE WHEN dl.delay_type = 'Wet' THEN dl.duration_hours ELSE 0 END), 0) as wet_hours,
        COALESCE(SUM(CASE WHEN dl.delay_type = 'Standby' THEN dl.duration_hours ELSE 0 END), 0) as standby_hours,
        COALESCE(SUM(CASE WHEN dl.delay_type = 'Accident' THEN dl.duration_hours ELSE 0 END), 0) as accident_hours,
        COALESCE(SUM(CASE WHEN dl.delay_type = 'Wait Part' THEN dl.duration_hours ELSE 0 END), 0) as wait_part_hours,
        
        -- Breakdown Hours & Events from Maintenance
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(HOUR, created_at, completed_date)), 0) 
         FROM maintenance_jobs 
         WHERE unit_id = fs.unit_id AND status = 'Completed'
         AND completed_date >= DATE_FORMAT(NOW(), '%Y-%m-01')) as bd_hours,
         
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(HOUR, created_at, completed_date)), 0) 
         FROM maintenance_jobs 
         WHERE unit_id = fs.unit_id AND status = 'Completed' AND priority = 'Low'
         AND completed_date >= DATE_FORMAT(NOW(), '%Y-%m-01')) as sched_dur_hours,
         
        (SELECT COUNT(*) 
         FROM maintenance_jobs 
         WHERE unit_id = fs.unit_id AND status = 'Completed' AND priority = 'Low'
         AND completed_date >= DATE_FORMAT(NOW(), '%Y-%m-01')) as sched_events,
         
        (SELECT COUNT(*) 
         FROM maintenance_jobs 
         WHERE unit_id = fs.unit_id AND status = 'Completed' AND priority != 'Low'
         AND completed_date >= DATE_FORMAT(NOW(), '%Y-%m-01')) as unschd_events
      FROM fleet_status fs
      LEFT JOIN (
        SELECT unit_id, MIN(hm_start) as hm_start 
        FROM unit_daily_hm 
        WHERE log_date >= DATE_FORMAT(NOW(), '%Y-%m-01')
        GROUP BY unit_id
      ) dh ON fs.unit_id = dh.unit_id
      LEFT JOIN unit_delay_logs dl ON fs.unit_id = dl.unit_id
      GROUP BY fs.unit_id, fs.model, dh.hm_start, fs.next_pm_hours
      ORDER BY fs.unit_id ASC
    `);

    // 6. Historical Trends (Point 8)
    const history: any = await query(`
      SELECT log_date, AVG(pa) as avg_pa, AVG(ma) as avg_ma
      FROM kpi_logs
      GROUP BY log_date
      ORDER BY log_date DESC
      LIMIT 7
    `);

    // 7. Live Activity Logs
    const activities: any = await query(`
      SELECT user_name, action, module, details, created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Calculate Dynamic KPIs based on real hours
    const totalMonthHours = new Date().getDate() * 24; // Base hours passed this month
    const processedFleet = rawFleetData.map((unit: any) => {
      const workHours = Number(unit.work_hours) || 0;
      const bdHours = Number(unit.bd_hours) || 0;
      const standbyHours = Number(unit.standby_hours) || 0;
      
      const schedDurHours = Number(unit.sched_dur_hours) || 0;
      const unschdDurHours = Math.max(bdHours - schedDurHours, 0); 
      
      const schedEvents = Number(unit.sched_events) || 0;
      const unschdEvents = Number(unit.unschd_events) || 0;
      const totalEvents = schedEvents + unschdEvents || 1; 

      // Standard PA, MA, UA, EU logic
      const pa = workHours + bdHours > 0 ? ((workHours + standbyHours) / (workHours + bdHours + standbyHours)) * 100 : 100;
      const ma = workHours + bdHours > 0 ? (workHours / (workHours + bdHours)) * 100 : 100;
      const ua = workHours + standbyHours > 0 ? (workHours / (workHours + standbyHours)) * 100 : 100;
      const eu = (pa * ua) / 100;

      // Base hours for percentages (whichever is greater to avoid > 100%)
      const baseHours = Math.max(workHours + bdHours + standbyHours, totalMonthHours, 1);
      
      return {
        ...unit,
        running: unit.hm_running - unit.awal_bulan,
        pa: pa.toFixed(1),
        ma: ma.toFixed(1),
        ua: ua.toFixed(1),
        eu: eu.toFixed(1),
        d_percent: ((bdHours / baseHours) * 100).toFixed(1),
        sched_dur_percent: ((schedDurHours / baseHours) * 100).toFixed(1),
        unschd_dur_percent: ((unschdDurHours / baseHours) * 100).toFixed(1),
        sched_event_percent: ((schedEvents / totalEvents) * 100).toFixed(1),
        unschd_event_percent: ((unschdEvents / totalEvents) * 100).toFixed(1),
      };
    });

    return successResponse({
      metrics: {
        pa: parseFloat(livePA.toFixed(1)),
        ma: parseFloat(liveMA.toFixed(1)),
        ua: parseFloat(liveUA.toFixed(1)),
        eu: parseFloat((livePA * liveUA / 100).toFixed(1)),
        mttr: 4.5,
        mtbf: 120,
      },
      pareto: maintenanceData.map((m: any) => ({
        component: m.description || "General Repair",
        frequency: m.frequency,
        downtime: m.frequency * 8 
      })),
      downUnits: downUnits.map((u: any) => ({
        ...u,
        dur: "Active"
      })),
      dailyFleet: processedFleet,
      hierarchy,
      history,
      activities
    });

  } catch (error: any) {
    console.error("KPI API Error:", error);
    return errorResponse(error.message);
  }
}
