import { Hono } from "hono";
import { getOverallRoomScores } from "../functions/get-scores.js";
import { OsuAPI } from "../osu-api.js";

const generalApi = new Hono().basePath("/api");

export { generalApi };
