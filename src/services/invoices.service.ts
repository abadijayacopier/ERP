import { pool } from "@/lib/db";

export const InvoicesService = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM invoices ORDER BY created_at DESC");
    return rows;
  },

  async getById(id: string) {
    const [rows]: any = await pool.query("SELECT * FROM invoices WHERE id = ?", [id]);
    if (rows.length === 0) throw new Error("Invoice not found");
    return rows[0];
  },

  async create(data: any) {
    const { invoice_number, client_name, project_name, issue_date, due_date, total_amount, status } = data;
    
    if (!invoice_number || !client_name || !total_amount) {
      throw new Error("Missing required invoice fields (Number, Client, Amount)");
    }

    const [result]: any = await pool.query(
      "INSERT INTO invoices (invoice_number, client_name, project_name, issue_date, due_date, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [invoice_number, client_name, project_name, issue_date, due_date, total_amount, status]
    );

    return { id: result.insertId, ...data };
  },

  async update(id: string, data: any) {
    const { client_name, project_name, issue_date, due_date, total_amount, status } = data;
    
    const [result]: any = await pool.query(
      "UPDATE invoices SET client_name = ?, project_name = ?, issue_date = ?, due_date = ?, total_amount = ?, status = ? WHERE id = ?",
      [client_name, project_name, issue_date, due_date, total_amount, status, id]
    );

    if (result.affectedRows === 0) throw new Error("Invoice not found or no changes made");
    
    return { id, ...data };
  },

  async delete(id: string) {
    await pool.query("DELETE FROM invoices WHERE id = ?", [id]);
    return { success: true };
  }
};
