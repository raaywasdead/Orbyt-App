import bcrypt from 'bcrypt';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import pkg from 'pg';
import connectPg from 'connect-pg-simple';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import crypto from 'crypto';

dotenv.config();

const { Pool } = pkg;
const app = express();

// ──────────────────────────────────────────────
// Resend — envio de e-mails transacionais
// ──────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY);

// ──────────────────────────────────────────────
// PostgreSQL
// DATABASE_URL vem do Railway automaticamente
// ──────────────────────────────────────────────

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ──────────────────────────────────────────────
// Redis
// Sessões centralizadas — não se perdem entre restarts
// REDIS_URL vem do Railway automaticamente
// ──────────────────────────────────────────────

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);
redisClient.on('error', (err) => console.error('Redis error:', err));

// ──────────────────────────────────────────────
// Criar tabelas se não existirem
// ──────────────────────────────────────────────

await db.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
    )
`);

await db.query(`
    CREATE TABLE IF NOT EXISTS dados_usuario (
        usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
        dados JSONB NOT NULL DEFAULT '{}',
        atualizado_em TIMESTAMP DEFAULT NOW()
    )
`);

// ──────────────────────────────────────────────
// Tokens de redefinição de senha
// ──────────────────────────────────────────────
await db.query(`
    CREATE TABLE IF NOT EXISTS reset_tokens (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expira_em TIMESTAMP NOT NULL,
        usado BOOLEAN DEFAULT FALSE
    )
`);

// ──────────────────────────────────────────────
// Helmet — headers de segurança / anti-XSS
// ──────────────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.set('trust proxy', 1);

// ──────────────────────────────────────────────
// Sessão com Redis store
// httpOnly + sameSite strict = anti-CSRF
// ──────────────────────────────────────────────

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// ──────────────────────────────────────────────
// Rate Limiting — 10 tentativas a cada 15 min
// ──────────────────────────────────────────────

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { sucesso: false, mensagem: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});

// ──────────────────────────────────────────────
// Helper — nunca retorna a senha na resposta
// ──────────────────────────────────────────────

function usuarioSeguro(user) {
    return { id: user.id, nome: user.nome, email: user.email, role: user.role };
}

// ──────────────────────────────────────────────
// Helper — checa erros de validação
// ──────────────────────────────────────────────

function validar(req, res, next) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
        return res.status(422).json({ sucesso: false, erros: erros.array().map(e => e.msg) });
    }
    next();
}

// ──────────────────────────────────────────────
// Regras de validação e sanitização
// ──────────────────────────────────────────────

const regraSignup = [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 100 }).withMessage('Nome muito longo').escape(),
    body('email').trim().notEmpty().withMessage('E-mail é obrigatório').isEmail().withMessage('E-mail inválido').normalizeEmail(),
    body('senha')
        .notEmpty().withMessage('Senha é obrigatória')
        .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
        .matches(/[A-Z]/).withMessage('Senha deve ter pelo menos uma letra maiúscula')
        .matches(/[0-9]/).withMessage('Senha deve ter pelo menos um número')
];

const regraLogin = [
    body('email').trim().notEmpty().withMessage('E-mail é obrigatório').isEmail().withMessage('E-mail inválido').normalizeEmail(),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
];

// ──────────────────────────────────────────────
// Passport — Estratégia Local
// ──────────────────────────────────────────────

passport.use(new LocalStrategy(
    { usernameField: 'email', passwordField: 'senha' },
    async (email, senha, done) => {
        try {
            const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
            const row = rows[0];
            if (!row) return done(null, false, { mensagem: 'E-mail ou senha inválidos' });

            const result = await bcrypt.compare(senha, row.senha);
            if (!result) return done(null, false, { mensagem: 'E-mail ou senha inválidos' });

            return done(null, row);
        } catch (err) {
            return done(err);
        }
    }
));

// ──────────────────────────────────────────────
// Passport — Estratégia Google
// ──────────────────────────────────────────────

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// ──────────────────────────────────────────────
// Serialização da sessão
// ──────────────────────────────────────────────

passport.serializeUser((user, done) => {
    done(null, user.id ? { id: user.id, source: 'local' } : { profile: user, source: 'google' });
});

passport.deserializeUser(async (data, done) => {
    if (data.source === 'local') {
        try {
            const { rows } = await db.query('SELECT * FROM usuarios WHERE id = $1', [data.id]);
            done(null, rows[0]);
        } catch (err) {
            done(err);
        }
    } else {
        done(null, data.profile);
    }
});

// ──────────────────────────────────────────────
// Middlewares de permissão
// ──────────────────────────────────────────────

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ sucesso: false, mensagem: 'Não autenticado' });
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.status(403).json({ sucesso: false, mensagem: 'Acesso negado' });
}

// ──────────────────────────────────────────────
// Google OAuth
// ──────────────────────────────────────────────

app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => { res.redirect(process.env.FRONTEND_URL + '/'); }
);

// ──────────────────────────────────────────────
// Signup
// ──────────────────────────────────────────────

app.post('/api/signup', authLimiter, regraSignup, validar, async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const { rows } = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (rows[0]) return res.status(409).json({ sucesso: false, mensagem: 'E-mail já cadastrado' });

        const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
        const hash = await bcrypt.hash(senha, 10);

        await db.query(
            'INSERT INTO usuarios (nome, email, senha, role) VALUES ($1, $2, $3, $4)',
            [nome, email, hash, role]
        );

        res.json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar usuário' });
    }
});

// ──────────────────────────────────────────────
// Login
// ──────────────────────────────────────────────

app.post('/api/login', authLimiter, regraLogin, validar, (req, res, next) => {
    passport.authenticate('local', (err, usuario, info) => {
        if (err) return res.status(500).json({ sucesso: false, mensagem: 'Erro interno' });
        if (!usuario) return res.status(401).json({ sucesso: false, mensagem: info?.mensagem || 'Credenciais inválidas' });

        req.logIn(usuario, (err) => {
            if (err) return res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar sessão' });
            req.session.save((saveErr) => {
                if (saveErr) return res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar sessão' });
                res.json({ sucesso: true, mensagem: 'Login realizado com sucesso!', usuario: usuarioSeguro(usuario) });
            });
        });
    })(req, res, next);
});

// ──────────────────────────────────────────────
// Logout
// ──────────────────────────────────────────────

app.post('/api/logout', isAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ sucesso: false, mensagem: 'Erro ao fazer logout' });
        res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso!' });
    });
});

// ──────────────────────────────────────────────
// Sessão atual
// ──────────────────────────────────────────────

app.get('/api/me', isAuthenticated, (req, res) => {
    res.json({ sucesso: true, usuario: usuarioSeguro(req.user) });
});

// ──────────────────────────────────────────────
// Admin — Listar usuários
// ──────────────────────────────────────────────

app.get('/api/admin/usuarios', isAdmin, async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT u.id, u.nome, u.email, u.role,
                d.atualizado_em AS ultimo_sync
            FROM usuarios u
            LEFT JOIN dados_usuario d ON d.usuario_id = u.id
            ORDER BY u.id ASC
        `);
        res.json({ sucesso: true, usuarios: rows });
    } catch (err) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar usuários' });
    }
});

// Admin — Estatísticas gerais
app.get('/api/admin/stats', isAdmin, async (_req, res) => {
    try {
        const [totalRes, syncRes] = await Promise.all([
            db.query('SELECT COUNT(*) AS total FROM usuarios'),
            db.query('SELECT COUNT(*) AS total FROM dados_usuario'),
        ]);
        res.json({
            sucesso: true,
            totalUsuarios: parseInt(totalRes.rows[0].total),
            totalComDados: parseInt(syncRes.rows[0].total),
        });
    } catch (err) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar estatísticas' });
    }
});

// Admin — Deletar usuário
app.delete('/api/admin/usuarios/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ sucesso: false, mensagem: 'Você não pode deletar sua própria conta' });
    }
    try {
        const { rowCount } = await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
        res.json({ sucesso: true, mensagem: 'Usuário deletado' });
    } catch (err) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao deletar usuário' });
    }
});

// ──────────────────────────────────────────────
// Dados do usuário — carregar e salvar
// ──────────────────────────────────────────────

app.get('/api/dados', isAuthenticated, async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT dados FROM dados_usuario WHERE usuario_id = $1',
            [req.user.id]
        );
        res.json({ sucesso: true, dados: rows[0]?.dados ?? {} });
    } catch (err) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao carregar dados' });
    }
});

app.put('/api/dados', isAuthenticated, async (req, res) => {
    try {
        const { dados } = req.body;
        if (!dados || typeof dados !== 'object') {
            return res.status(400).json({ sucesso: false, mensagem: 'Dados inválidos' });
        }
        await db.query(`
            INSERT INTO dados_usuario (usuario_id, dados, atualizado_em)
            VALUES ($1, $2, NOW())
            ON CONFLICT (usuario_id)
            DO UPDATE SET dados = $2, atualizado_em = NOW()
        `, [req.user.id, JSON.stringify(dados)]);
        res.json({ sucesso: true });
    } catch (err) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar dados' });
    }
});

// ──────────────────────────────────────────────
// Esqueci minha senha — gera token e envia e-mail
// ──────────────────────────────────────────────

app.post('/api/forgot-password',
    authLimiter,
    body('email').trim().isEmail().normalizeEmail(),
    validar,
    async (req, res) => {
        const { email } = req.body;
        try {
            const { rows } = await db.query(
                'SELECT id FROM usuarios WHERE email = $1', [email]
            );

            if (!rows[0]) {
                return res.json({ sucesso: true });
            }

            const usuarioId = rows[0].id;

            await db.query(
                'UPDATE reset_tokens SET usado = TRUE WHERE usuario_id = $1',
                [usuarioId]
            );

            const token = crypto.randomBytes(32).toString('hex');
            const expiraEm = new Date(Date.now() + 60 * 60 * 1000);

            await db.query(
                'INSERT INTO reset_tokens (usuario_id, token, expira_em) VALUES ($1, $2, $3)',
                [usuarioId, token, expiraEm]
            );

            const link = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;

            await resend.emails.send({
                from: process.env.FROM_EMAIL,
                to: email,
                subject: 'Redefinição de senha — Orbyt',
                html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0a1e;padding:32px;border-radius:12px">
            <h2 style="color:#a855f7;margin-top:0">Redefinir senha</h2>
            <p style="color:#c4b5fd">Recebemos uma solicitação para redefinir a senha da sua conta Orbyt.</p>
            <a href="${link}" style="
                display:inline-block;padding:12px 24px;
                background:#a855f7;color:#fff;border-radius:8px;
                text-decoration:none;font-weight:600;margin:16px 0
            ">Redefinir minha senha</a>
            <p style="color:#888;font-size:0.85rem">
                Este link expira em 1 hora.<br>
                Se você não solicitou isso, ignore este e-mail.
            </p>
        </div>
    `,
            });

            res.json({ sucesso: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar solicitação' });
        }
    }
);

// ──────────────────────────────────────────────
// Redefinir senha — valida token e salva nova senha
// ──────────────────────────────────────────────

app.post('/api/reset-password',
    authLimiter,
    body('token').notEmpty(),
    body('senha')
        .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
        .matches(/[A-Z]/).withMessage('Senha deve ter pelo menos uma letra maiúscula')
        .matches(/[0-9]/).withMessage('Senha deve ter pelo menos um número'),
    validar,
    async (req, res) => {
        const { token, senha } = req.body;
        try {
            const { rows } = await db.query(`
                SELECT * FROM reset_tokens
                WHERE token = $1
                  AND usado = FALSE
                  AND expira_em > NOW()
            `, [token]);

            if (!rows[0]) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Link inválido ou expirado. Solicite um novo.'
                });
            }

            const hash = await bcrypt.hash(senha, 10);

            await db.query(
                'UPDATE usuarios SET senha = $1 WHERE id = $2',
                [hash, rows[0].usuario_id]
            );

            await db.query(
                'UPDATE reset_tokens SET usado = TRUE WHERE id = $1',
                [rows[0].id]
            );

            res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao redefinir senha' });
        }
    }
);

// ──────────────────────────────────────────────
// Servidor
// PORT vem do Railway automaticamente
// ──────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
});