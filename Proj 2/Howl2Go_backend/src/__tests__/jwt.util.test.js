// import test from 'node:test';
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    extractTokenFromHeader,
} from "../utils/jwt.util.js";

const ORIGINAL_ENV = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
};

test.before(() => {
    process.env.JWT_SECRET = "test-access-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    process.env.JWT_REFRESH_EXPIRES_IN = "7d";
});

test.after(() => {
    process.env.JWT_SECRET = ORIGINAL_ENV.JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = ORIGINAL_ENV.JWT_REFRESH_SECRET;
    process.env.JWT_EXPIRES_IN = ORIGINAL_ENV.JWT_EXPIRES_IN;
    process.env.JWT_REFRESH_EXPIRES_IN = ORIGINAL_ENV.JWT_REFRESH_EXPIRES_IN;
});

test("generateAccessToken embeds id, email, and role claims", () => {
    const token = generateAccessToken("user-id", "user@example.com", "admin");

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        audience: "howl2go-app",
        issuer: "howl2go-api",
    });

    assert.equal(decoded.id, "user-id");
    assert.equal(decoded.email, "user@example.com");
    assert.equal(decoded.role, "admin");
});

test("generateAccessToken defaults role to user when omitted", () => {
    const token = generateAccessToken("user-id", "user@example.com");
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        audience: "howl2go-app",
        issuer: "howl2go-api",
    });

    assert.equal(decoded.role, "user");
});

test("generateRefreshToken creates refresh token with type claim", () => {
    const token = generateRefreshToken("refresh-id");
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        audience: "howl2go-app",
        issuer: "howl2go-api",
    });

    assert.equal(decoded.id, "refresh-id");
    assert.equal(decoded.type, "refresh");
});

test("verifyToken returns payload for valid access token", () => {
    const expected = {
        id: "user-id",
        email: "user@example.com",
        role: "admin",
    };
    const token = jwt.sign(expected, process.env.JWT_SECRET, {
        audience: "howl2go-app",
        issuer: "howl2go-api",
        expiresIn: "1h",
    });

    const decoded = verifyToken(token);

    assert.equal(decoded.id, expected.id);
    assert.equal(decoded.email, expected.email);
    assert.equal(decoded.role, expected.role);
});

test("verifyToken validates refresh tokens when flag is set", () => {
    const token = jwt.sign(
        { id: "refresh-id", type: "refresh" },
        process.env.JWT_REFRESH_SECRET,
        {
            audience: "howl2go-app",
            issuer: "howl2go-api",
            expiresIn: "2h",
        }
    );

    const decoded = verifyToken(token, true);

    assert.equal(decoded.id, "refresh-id");
    assert.equal(decoded.type, "refresh");
});

test("verifyToken throws helpful error for invalid token", () => {
    assert.throws(() => verifyToken("not-a-valid-token"), /Invalid token/);
});

test("verifyToken throws helpful error when token expired", () => {
    const expiredToken = jwt.sign({ id: "user-id" }, process.env.JWT_SECRET, {
        audience: "howl2go-app",
        issuer: "howl2go-api",
        expiresIn: -1, // already expired
    });

    assert.throws(() => verifyToken(expiredToken), /Token has expired/);
});

test("decodeToken returns payload without verification", () => {
    const token = jwt.sign(
        { id: "user-id", role: "user" },
        process.env.JWT_SECRET,
        {
            audience: "howl2go-app",
            issuer: "howl2go-api",
            expiresIn: "1h",
        }
    );

    const decoded = decodeToken(token);

    assert.equal(decoded.id, "user-id");
    assert.equal(decoded.role, "user");
});

test("decodeToken returns null for malformed token", () => {
    const decoded = decodeToken("clearly-invalid");
    assert.equal(decoded, null);
});

test("extractTokenFromHeader supports Bearer scheme", () => {
    const token = extractTokenFromHeader("Bearer abc.def.ghi");
    assert.equal(token, "abc.def.ghi");
});

test("extractTokenFromHeader returns raw token when Bearer absent", () => {
    const token = extractTokenFromHeader("abc.def.ghi");
    assert.equal(token, "abc.def.ghi");
});

test("extractTokenFromHeader returns null when header missing", () => {
    const token = extractTokenFromHeader(undefined);
    assert.equal(token, null);
});
