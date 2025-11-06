import { describe, test, expect, afterAll, beforeAll } from "@jest/globals";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import connectDB from "../config/database.js";

describe("Database Connection Tests", () => {
    afterAll(async () => {
        await mongoose.connection.close();
    });

    test("should connect to MongoDB successfully", async () => {
        const conn = await connectDB();

        expect(conn).toBeDefined();
        expect(conn.connection.readyState).toBe(1); // 1 = connected
        expect(conn.connection.host).toBeDefined();
    });

    test("should have database name defined", async () => {
        const dbName = mongoose.connection.name;

        expect(dbName).toBeDefined();
        expect(typeof dbName).toBe("string");
    });

    test("should be connected to test database", async () => {
        const dbName = mongoose.connection.name;

        // Verify we're using test database
        expect(dbName.includes("test") || process.env.NODE_ENV === "test").toBe(true);
    });

    test("should have connection host defined", async () => {
        const host = mongoose.connection.host;

        expect(host).toBeDefined();
        expect(typeof host).toBe("string");
    });

    test("should maintain connection state", async () => {
        const readyState = mongoose.connection.readyState;

        expect(readyState).toBe(1); // 1 = connected
    });

    test("should have connection configuration", async () => {
        const connection = mongoose.connection;

        expect(connection).toBeDefined();
        expect(connection.db).toBeDefined();
    });

    test("should handle connection string", async () => {
        const connection = mongoose.connection;

        expect(connection._connectionString).toBeDefined();
    });

    test("should have proper connection options", async () => {
        const connection = mongoose.connection;

        expect(connection.options).toBeDefined();
    });

    test("should be able to check connection status", () => {
        const isConnected = mongoose.connection.readyState === 1;

        expect(isConnected).toBe(true);
    });

    test("should have database client", () => {
        const client = mongoose.connection.getClient();

        expect(client).toBeDefined();
    });
});
