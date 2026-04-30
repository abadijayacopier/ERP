import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export type UserRole = "EXECUTIVE" | "MANAGER" | "TECHNICIAN" | "HSE" | "ADMIN" | "STAFF" | "OPERATOR";

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  department: string;
  password?: string;
  is_active: boolean;
}

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const [rows]: any = await db.execute(
      "SELECT id, username, full_name, role, department, is_active FROM users ORDER BY id DESC"
    );
    return rows;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  static async verifyLogin(username: string, passwordAttempt: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user || !user.password) return null;

    const isValid = await bcrypt.compare(passwordAttempt, user.password);
    if (!isValid) return null;

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  static async createUser(data: Partial<User> & { password?: string }) {
    const { username, full_name, role, department, password } = data;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    const [result]: any = await db.execute(
      "INSERT INTO users (username, full_name, role, department, password, is_active) VALUES (?, ?, ?, ?, ?, 1)",
      [username || null, full_name || null, role || null, department || null, hashedPassword || null] as any[]
    );
    return { id: result.insertId, ...data };
  }

  static async updateUser(id: number, data: Partial<User>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
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
      { id: "dsr", label: "Shift Reports (DSR)", icon: "ClipboardList", roles: ["MANAGER", "ADMIN", "STAFF", "OPERATOR"] },
      { id: "logistics", label: "Fuel & Logistics", icon: "Droplets", roles: ["MANAGER", "ADMIN", "STAFF"] },
      { id: "hse", label: "Safety & HSE", icon: "ShieldAlert", roles: ["EXECUTIVE", "MANAGER", "HSE", "ADMIN"] },
      { id: "settings", label: "System Settings", icon: "Settings", roles: ["ADMIN"] },
    ];

    return allMenus.filter(menu => menu.roles.includes(role));
  }
}
