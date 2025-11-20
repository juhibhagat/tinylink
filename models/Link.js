const { pool } = require('../config/database');

class Link {
  static async create({ code, originalUrl }) {
    const query = `
      INSERT INTO links (code, original_url)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [code, originalUrl]);
    return result.rows[0];
  }

  static async findByCode(code) {
    const query = 'SELECT * FROM links WHERE code = $1';
    const result = await pool.query(query, [code]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM links ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async incrementClicks(code) {
    const query = `
      UPDATE links 
      SET clicks = clicks + 1, last_clicked_at = CURRENT_TIMESTAMP 
      WHERE code = $1
      RETURNING *
    `;
    const result = await pool.query(query, [code]);
    return result.rows[0];
  }

  static async delete(code) {
    const query = 'DELETE FROM links WHERE code = $1';
    await pool.query(query, [code]);
    return true;
  }

  static async codeExists(code) {
    const query = 'SELECT 1 FROM links WHERE code = $1';
    const result = await pool.query(query, [code]);
    return result.rows.length > 0;
  }
}

module.exports = Link;