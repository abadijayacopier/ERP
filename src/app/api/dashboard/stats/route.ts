import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const [
      fleetByStatus,
      fleetByType,
      productionStats,
      inventoryStats,
      incidentStats,
      maintenanceDue
    ]: any = await Promise.all([
      query('SELECT status, COUNT(*) as count FROM fleet_status GROUP BY status'),
      query('SELECT unit_type, COUNT(*) as count FROM fleet_status GROUP BY unit_type'),
      query('SELECT SUM(production_bcm) as total FROM dsr_reports'),
      query('SELECT COUNT(*) as count FROM general_inventory WHERE stock_quantity <= min_stock_level'),
      query('SELECT COUNT(*) as count FROM activity_logs WHERE module = "Safety" AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)'),
      query('SELECT COUNT(*) as count FROM fleet_status WHERE status = "Maintenance" OR status = "Breakdown"')
    ]);

    return successResponse({
      fleet: fleetByStatus,
      fleetTypes: fleetByType,
      production: productionStats[0]?.total || 0,
      lowStock: inventoryStats[0]?.count || 0,
      recentIncidents: incidentStats[0]?.count || 0,
      maintenanceDue: maintenanceDue[0]?.count || 0
    });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
