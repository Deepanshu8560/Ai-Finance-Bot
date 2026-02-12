import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from root directory (since server/ is a subdirectory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;
const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_prod';

app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for Neon
    },
});

// Initialize Tables
const initDb = async () => {
    try {
        // 1. Create Users Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Create/Update Memory Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_memory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Check if user_id column exists, if not add it (migration step)
        const checkCol = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='user_memory' AND column_name='user_id';
    `);

        if (checkCol.rowCount === 0) {
            await pool.query('ALTER TABLE user_memory ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;');
            console.log("Added user_id column to user_memory");
        }

        // 3. Create Messages Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log("Database tables initialized");
    } catch (err) {
        console.error("Error initializing DB:", err);
    }
};

initDb();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

// --- AUTH ROUTES ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ auth: true, token, user });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const passwordIsValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordIsValid) return res.status(401).json({ auth: false, token: null });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ auth: true, token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Google Login
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error("GOOGLE_CLIENT_ID is not configured on the server");
            return res.status(500).json({ error: 'Google Auth is not configured on the server' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();

        // Find or Create User
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            // Create new user with random password (since they use Google)
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 8);
            result = await pool.query(
                'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
                [name, email, hashedPassword]
            );
            user = result.rows[0];
        }

        const appToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ auth: true, token: appToken, user: { id: user.id, name: user.name, email: user.email, picture } });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(401).json({ error: 'Invalid Google Token' });
    }
});


// --- MEMORY ROUTES (Protected) ---

app.get('/api/memory', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_memory WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/memory', verifyToken, async (req, res) => {
    const { category, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO user_memory (user_id, category, content) VALUES ($1, $2, $3) RETURNING *',
            [req.userId, category || 'General', content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/memory/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Ensure user only deletes their own memory
        const result = await pool.query('DELETE FROM user_memory WHERE id = $1 AND user_id = $2', [id, req.userId]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Memory not found or unauthorized' });
        res.json({ message: 'Memory deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/memory', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM user_memory WHERE user_id = $1', [req.userId]);
        res.json({ message: 'All memories cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CHAT HISTORY ROUTES (Protected) ---

app.get('/api/chat', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT role, content FROM messages WHERE user_id = $1 ORDER BY created_at ASC', [req.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chat', verifyToken, async (req, res) => {
    const { role, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO messages (user_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [req.userId, role, content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/chat', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM messages WHERE user_id = $1', [req.userId]);
        res.json({ message: 'Chat history cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export app for Vercel
export default app;

// Only listen if not running on Vercel (local dev)
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Backend running on http://localhost:${port}`);
    });
}
