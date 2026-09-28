import { OsuAPI } from "../osu-api.js";
import { db } from "../database/db.js";
import { eq } from "drizzle-orm";
import { rooms, playlist_items } from "../database/schema.js";

async function addRoomWithPlaylist(roomId: number) {
	const room = await OsuAPI.getRoomInfo(roomId);

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
}

export { addRoomWithPlaylist };
