import { OsuAPI } from "../osu-api.js";
import { db } from "../database/db.js";
import { eq } from "drizzle-orm";
import { rooms, playlist_items } from "../database/schema.js";
import { ConsolePrefixed } from "../utils/console-prefixed.js";
import type { StatusCode } from "hono/utils/http-status";
import { APIError } from "osu-api-v2-js";

const consolePref = new ConsolePrefixed("[addRoomWithPlaylist]");

async function addRoomWithPlaylist(roomId: number): Promise<{
	success: boolean;
	message?: string;
	suggestedHttpCode?: StatusCode;
}> {
	try {
		const room = await OsuAPI.getRoomInfo(roomId);

		if (room.category !== "daily_challenge") {
			return {
				success: false,
				message: "Please insert a daily challenge playlist",
				suggestedHttpCode: 400,
			};
		}

		const existingRoom = (
			await db.select().from(rooms).where(eq(rooms.room_id, room.id))
		)[0];
		if (existingRoom) {
			await db
				.update(rooms)
				.set({
					name: room.name,
					start_date: room.starts_at,
					end_date: room.ends_at || null,
				})
				.where(eq(rooms.room_id, room.id));
		} else {
			await db.insert(rooms).values({
				room_id: room.id,
				name: room.name,
				start_date: room.starts_at,
				end_date: room.ends_at || null,
			});
		}

		const playlist = room.playlist;
		if (Array.isArray(playlist)) {
			const existingPlaylist = await db
				.select()
				.from(playlist_items)
				.where(eq(playlist_items.room_id, room.id));
			if (existingPlaylist.length > 0) {
				await db
					.delete(playlist_items)
					.where(eq(playlist_items.room_id, room.id));
			}
			for (let i = 0; i < playlist.length; i++) {
				const playlistItem = playlist[i];
				await db.insert(playlist_items).values({
					playlist_item_id: playlistItem.id,
					room_id: playlistItem.room_id,
					beatmapset_id: playlistItem.beatmap.beatmapset_id,
					beatmapset_title: playlistItem.beatmap.beatmapset.title,
					beatmapset_artist: playlistItem.beatmap.beatmapset.artist,
					beatmap_id: playlistItem.beatmap_id,
					beatmap_difficulty_rating: playlistItem.beatmap.difficulty_rating,
					beatmap_version: playlistItem.beatmap.version,
				});
			}
		}

		return {
			success: true,
		};
	} catch (error) {
		consolePref.error(error);
		let errorMessage = "Internal server error";
		let httpCode: StatusCode = 500;

		if (error instanceof APIError) {
			if (error.response?.status_code === 404) {
				httpCode = 404;
				errorMessage = "Room not found";
			} else {
				httpCode = 500;
				errorMessage = "API Error";
			}
		}

		return {
			success: false,
			message: errorMessage,
			suggestedHttpCode: httpCode,
		};
	}
}

export { addRoomWithPlaylist };
