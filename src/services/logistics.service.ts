import { pool } from "@/lib/db";

export const LogisticsService = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT l.*, i.item_name 
      FROM inventory_transactions l
      LEFT JOIN general_inventory i ON l.item_id = i.id
      WHERE l.item_type = 'Fuel'
      ORDER BY l.created_at DESC
    `);
    return rows;
  },

  async create(data: any) {
    const { item_id, transaction_type, quantity, reference_id, user_name } = data;
    
    if (!item_id || !transaction_type || !quantity || !reference_id || !user_name) {
      throw new Error("Missing required fields for logistics record");
    }

    const [result]: any = await pool.query(
      "INSERT INTO inventory_transactions (item_id, item_type, transaction_type, quantity, reference_id, user_name) VALUES (?, 'Fuel', ?, ?, ?, ?)",
      [item_id, transaction_type, quantity, reference_id, user_name]
    );

    // Update General Inventory Stock
    const factor = transaction_type === 'In' ? 1 : -1;
    await pool.query(
      "UPDATE general_inventory SET stock_quantity = stock_quantity + (?) WHERE id = ?",
      [quantity * factor, item_id]
    );

    return { id: result.insertId, ...data };
  },

  async update(id: string, data: any) {
    const { item_id, transaction_type, quantity, reference_id, user_name } = data;
    
    const [oldRows]: any = await pool.query("SELECT * FROM inventory_transactions WHERE id = ? AND item_type = 'Fuel'", [id]);
    if (oldRows.length === 0) throw new Error("Transaction not found");
    
    const oldTx = oldRows[0];

    // Revert old stock
    const oldFactor = oldTx.transaction_type === 'In' ? -1 : 1;
    await pool.query(
      "UPDATE general_inventory SET stock_quantity = stock_quantity + (?) WHERE id = ?",
      [oldTx.quantity * oldFactor, oldTx.item_id]
    );

    // Update transaction record
    await pool.query(
      "UPDATE inventory_transactions SET item_id = ?, transaction_type = ?, quantity = ?, reference_id = ?, user_name = ? WHERE id = ? AND item_type = 'Fuel'",
      [item_id, transaction_type, quantity, reference_id, user_name, id]
    );

    // Apply new stock
    const newFactor = transaction_type === 'In' ? 1 : -1;
    await pool.query(
      "UPDATE general_inventory SET stock_quantity = stock_quantity + (?) WHERE id = ?",
      [quantity * newFactor, item_id]
    );

    return { id, ...data };
  },

  async delete(id: string) {
    const [oldRows]: any = await pool.query("SELECT * FROM inventory_transactions WHERE id = ? AND item_type = 'Fuel'", [id]);
    if (oldRows.length > 0) {
      const oldTx = oldRows[0];
      const factor = oldTx.transaction_type === 'In' ? -1 : 1;
      await pool.query(
        "UPDATE general_inventory SET stock_quantity = stock_quantity + (?) WHERE id = ?",
        [oldTx.quantity * factor, oldTx.item_id]
      );
    }

    await pool.query("DELETE FROM inventory_transactions WHERE id = ? AND item_type = 'Fuel'", [id]);
    return { success: true };
  }
};
