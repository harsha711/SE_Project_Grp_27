/**
 * Simple counter model
 *
 * Provides a tiny collection used to store named numeric counters (e.g. for
 * sequential `orderNumber` assignments). The application increments the
 * `seq` field atomically with `findOneAndUpdate({ $inc: { seq: 1 } })` and uses
 * the result to allocate a stable, sequential number for user-facing order IDs.
 *
 * @author Ahmed Hassan
 */
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
