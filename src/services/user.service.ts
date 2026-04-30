import { db } from "@/lib/db";

export type UserRole = "EXECUTIVE" | "MANAGER" | "TECHNICIAN" | "HSE" | "ADMIN" | "STAFF";

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  department: string;
  is_active: boolean;
}

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const [rows]: any = await db.execute(
      "SELECT id, username, full_name, role, department, is_active FROM users ORDER BY id DESC"
    );
    return rows;
  }

  static async createUser(data: Partial<User> & { password?: string }) {
    const { username, full_name, role, department, password } = data;
    const [result]: any = await db.execute(
      "INSERT INTO users (username, full_name, role, department, password, is_active) VALUES (?, ?, ?, ?, ?, 1)",
      [username, full_name, role, department, password]
    );
    return { id: result.insertId, ...data };
  }

  static async updateUser(id: number, data: Partial<User>) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(", ");
    const values = [...Object.values(data), id];
    await db.execute(`UPDATE users SET ${fields} WHERE id = ?`, values);
    return { id, ...data };
  }

  static async deleteUser(id: number) {
    await db.execute("DELETE FROM users WHERE id = ?", [id]);
    return { success: true };
  }

  // Get menus based on Role
  static getMenusByRole(role: UserRole) {
    const allMenus = [
      { id: "dashboard", label: "Executive Dashboard", icon: "Layout", roles: ["EXECUTIVE", "ADMIN"] },
      { id: "fleet", label: "Fleet Monitoring", icon: "Truck", roles: ["EXECUTIVE", "MANAGER", "ADMIN"] },
      { id: "maintenance", label: "Maintenance & Parts", icon: "Wrench", roles: ["MANAGER", "TECHNICIAN", "ADMIN"] },
      { id: "inventory", label: "Inventory System", icon: "Package", roles: ["MANAGER", "TECHNICIAN", "ADMIN", "STAFF"] },
      { id: "invoices", label: "Invoices & Billing", icon: "FileText", roles: ["EXECUTIVE", "ADMIN", "STAFF"] },
      { id: "dsr", label: "Shift Reports (DSR)", icon: "ClipboardList", roles: ["MANAGER", "ADMIN", "STAFF"] },
      { id: "logistics", label: "Fuel & Logistics", icon: "Droplets", roles: ["MANAGER", "ADMIN", "STAFF"] },
      { id: "hse", label: "Safety & HSE", icon: "ShieldAlert", roles: ["EXECUTIVE", "MANAGER", "HSE", "ADMIN"] },
      { id: "settings", label: "System Settings", icon: "Settings", roles: ["ADMIN"] },
    ];

    return allMenus.filter(menu => menu.roles.includes(role));
  }
}
