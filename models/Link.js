const { pool } = require('../config/database');

class Link {
  static async create({ code, originalUrl }) {
    try {
      // Additional validation in model
      if (!code || !originalUrl) {
        throw new Error('Code and URL are required');
      }

      // Validate code format in model
      if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
        throw new Error('Code must be 6-8 characters and contain only letters and numbers');
      }

      // Validate URL in model
      try {
        new URL(originalUrl);
      } catch (err) {
        throw new Error('Invalid URL format');
      }

      const query = `
        INSERT INTO links (code, original_url)
        VALUES ($1, $2)
        RETURNING *
      `;
      const result = await pool.query(query, [code, originalUrl]);
      return result.rows[0];
    } catch (error) {
      // Handle unique constraint violation (duplicate code)
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new Error('Code already exists');
      }
      throw error;
    }
  }

  static async findByCode(code) {
    if (!code) {
      throw new Error('Code is required');
    }

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
    if (!code) {
      throw new Error('Code is required');
    }

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
    if (!code) {
      throw new Error('Code is required');
    }

    const query = 'DELETE FROM links WHERE code = $1';
    const result = await pool.query(query, [code]);
    
    // Check if any row was deleted
    if (result.rowCount === 0) {
      throw new Error('Link not found');
    }
    
    return true;
  }

  static async codeExists(code) {
    if (!code) {
      throw new Error('Code is required');
    }

    const query = 'SELECT 1 FROM links WHERE code = $1';
    const result = await pool.query(query, [code]);
    return result.rows.length > 0;
  }

  // New method: Generate random code
  static generateRandomCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // New method: Validate code format
  static isValidCode(code) {
    return /^[A-Za-z0-9]{6,8}$/.test(code);
  }

  // New method: Validate URL
  static isValidUrl(url) {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (err) {
      return false;
    }
  }
}

module.exports = Link;