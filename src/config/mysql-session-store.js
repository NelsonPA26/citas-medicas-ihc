const session = require('express-session');

class MySqlSessionStore extends session.Store {
  constructor(pool, options = {}) {
    super();
    this.pool = pool;
    this.ttlMs = options.ttlMs || 30 * 60 * 1000;
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS sesion_usuario (
        session_id VARCHAR(128) PRIMARY KEY,
        data LONGTEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sesion_usuario_expira (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  getExpiration(sessionData) {
    const expires = sessionData && sessionData.cookie && sessionData.cookie.expires
      ? new Date(sessionData.cookie.expires)
      : null;

    return expires && !Number.isNaN(expires.getTime())
      ? expires
      : new Date(Date.now() + this.ttlMs);
  }

  get(sessionId, callback) {
    this.pool.query(
      'SELECT data FROM sesion_usuario WHERE session_id = ? AND expires_at > NOW() LIMIT 1',
      [sessionId]
    ).then(([rows]) => {
      if (!rows.length) return callback(null, null);

      try {
        return callback(null, JSON.parse(rows[0].data));
      } catch (error) {
        return callback(error);
      }
    }).catch(callback);
  }

  set(sessionId, sessionData, callback = () => {}) {
    const expiresAt = this.getExpiration(sessionData);

    this.pool.query(
      `
        INSERT INTO sesion_usuario (session_id, data, expires_at)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data), expires_at = VALUES(expires_at)
      `,
      [sessionId, JSON.stringify(sessionData), expiresAt]
    ).then(() => callback(null)).catch(callback);
  }

  touch(sessionId, sessionData, callback = () => {}) {
    this.pool.query(
      'UPDATE sesion_usuario SET expires_at = ? WHERE session_id = ?',
      [this.getExpiration(sessionData), sessionId]
    ).then(() => callback(null)).catch(callback);
  }

  destroy(sessionId, callback = () => {}) {
    this.pool.query(
      'DELETE FROM sesion_usuario WHERE session_id = ?',
      [sessionId]
    ).then(() => callback(null)).catch(callback);
  }
}

module.exports = MySqlSessionStore;
