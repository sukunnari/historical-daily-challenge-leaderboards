import { Hono } from "hono";
import { addRoomWithPlaylist } from "../functions/add-room-playlist.js";
import { addRoomScores } from "../functions/add-room-scores.js";

// ======= Management api =======
const MANAGEMENT_PASSWORD = process.env.MANAGE_PASSWORD;
if (!MANAGEMENT_PASSWORD) {
	throw new Error(
		"Please configure these variables in the .env file: MANAGE_PASSWORD",
	);
}

const manageApi = new Hono().basePath(`/api/manage`);

// Middleware for all api below
manageApi.use("/*", async (c, next) => {
	try {
		const headers = c.req.header();
		const password = headers?.["api-password"] || "";

		if (password != MANAGEMENT_PASSWORD) {
			c.status(401);
			return c.json({
				success: false,
				message: "Forbidden",
			});
		}

		await next();
	} catch (error) {
		console.error(error);
		c.status(500);
		return c.json({
			success: false,
			message: "Internal Server Error",
		});
	}
});

manageApi.post("/add-room", async (c) => {
	const reqData = await c.req.json();
	const room = Number(reqData?.room);

	if (isNaN(room)) {
		c.status(401);
		return c.json({
			success: false,
			message: "Invalid room id",
		});
	}

	await addRoomWithPlaylist(room);

	c.status(200);
	return c.json({
		success: true,
	});
});

manageApi.post("/add-room-scores", async (c) => {
	const reqData = await c.req.json();
	const room = Number(reqData?.room);

	if (isNaN(room)) {
		c.status(401);
		return c.json({
			success: false,
			message: "Invalid room id",
		});
	}

	await addRoomScores(room);

	c.status(200);
	return c.json({
		success: true,
	});
});

export { manageApi };
