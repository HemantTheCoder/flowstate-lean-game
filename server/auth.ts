import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { getPool } from "./db.js";
import { User as SelectUser } from "../shared/schema.js";
import connectPg from "connect-pg-simple";

const PostgresStore = connectPg(session);

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
    let sessionStore: session.Store;

    if (process.env.DATABASE_URL) {
        try {
            console.log("[Auth] Attempting to use PostgresStore for sessions...");
            sessionStore = new PostgresStore({
                pool: getPool(),
                createTableIfMissing: true,
                errorLog: (...args) => console.error("[PostgresStore Error]", ...args)
            });
        } catch (err) {
            console.error("[Auth] Failed to initialize PostgresStore, falling back to MemoryStore:", err);
            const MemoryStore = require("memorystore")(session);
            sessionStore = new MemoryStore({
                checkPeriod: 86400000 // prune expired entries every 24h
            });
        }
    } else {
        console.warn("[Auth] No DATABASE_URL found, using MemoryStore for sessions.");
        const MemoryStore = require("memorystore")(session);
        sessionStore = new MemoryStore({
            checkPeriod: 86400000
        });
    }

    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "flowstate_secret_key",
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        }
    };

    console.log("[Auth] Session middleware configured with " + (sessionStore instanceof PostgresStore ? "PostgresStore" : "MemoryStore"));

    app.set("trust proxy", 1);
    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                if (!user || !(await comparePasswords(password, user.password))) {
                    return done(null, false, { message: "Invalid username or password" });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }),
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/register", async (req, res) => {
        try {
            console.log("[API] Register attempt for:", req.body?.username);
            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            const hashedPassword = await hashPassword(req.body.password);
            const user = await storage.createUser({
                ...req.body,
                password: hashedPassword,
            });

            req.login(user, (err) => {
                if (err) {
                    console.error("[API] Register Login Error:", err);
                    return res.status(500).json({ message: "Login failed after registration", error: String(err), stack: err instanceof Error ? err.stack : undefined });
                }
                return res.status(201).json(user);
            });
        } catch (err) {
            console.error("[API] Register Fatal Error:", err);
            res.status(500).json({
                message: "Fatal registration error",
                error: String(err),
                stack: err instanceof Error ? err.stack : undefined,
                dbStatus: !!process.env.DATABASE_URL
            });
        }
    });

    app.post("/api/login", (req, res) => {
        try {
            console.log("[API] Login attempt for:", req.body?.username);
            passport.authenticate("local", (err: any, user: Express.User, info: any) => {
                if (err) {
                    console.error("[API] Passport Auth Error:", err);
                    return res.status(500).json({ message: "Auth internal error", error: String(err), stack: err instanceof Error ? err.stack : undefined });
                }
                if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });

                req.login(user, (err) => {
                    if (err) {
                        console.error("[API] Login Session Error:", err);
                        return res.status(500).json({ message: "Session creation failed", error: String(err), stack: err instanceof Error ? err.stack : undefined });
                    }
                    return res.json(user);
                });
            })(req, res);
        } catch (err) {
            console.error("[API] Login Fatal Error:", err);
            res.status(500).json({
                message: "Fatal login error",
                error: String(err),
                stack: err instanceof Error ? err.stack : undefined
            });
        }
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });
}
