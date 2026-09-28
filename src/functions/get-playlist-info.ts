import { db } from "../database/db.js";
import { eq } from "drizzle-orm";
import { playlist_items } from "../database/schema.js";

async function getRoomPlaylist(roomId: number) {
	const playlistItems = await db
		.select()
		.from(playlist_items)
		.where(eq(playlist_items.room_id, roomId));

	return playlistItems;
}

async function getPlaylistInfo(playlistId: number) {
	const playlist = (
		await db
			.select()
			.from(playlist_items)
			.where(eq(playlist_items.playlist_item_id, playlistId))
	)[0];

	return playlist;
}

export { getRoomPlaylist, getPlaylistInfo };
