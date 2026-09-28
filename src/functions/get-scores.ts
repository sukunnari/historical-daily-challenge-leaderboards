import { db } from "../database/db.js";
import { eq, inArray, sum, and } from "drizzle-orm";
import {
	playlist_items,
	scores as scores_table,
	players,
} from "../database/schema.js";

async function getOverallRoomScores(roomId: number) {
	const playlistIds = (
		await db
			.select({ playlist_id: playlist_items.playlist_item_id })
			.from(playlist_items)
			.where(eq(playlist_items.room_id, roomId))
	).map((p) => p.playlist_id);

	const scores = await db
		.select({
			player_name: players.name,
			player_id: players.osu_id,
			total_scores: sum(scores_table.value),
		})
		.from(scores_table)
		.leftJoin(players, eq(scores_table.player, players.osu_id))
		.groupBy(scores_table.player)
		.where(inArray(scores_table.playlist_item_id, playlistIds));

	return scores;
}

async function getPlaylistScores(playlistId: number) {
	const scores = await db
		.select({
			player_name: players.name,
			player_id: players.osu_id,
			total_scores: scores_table.value,
			score_id: scores_table.score_id,
			score_mods: scores_table.mods,
			is_external: scores_table.external_source,
		})
		.from(scores_table)
		.leftJoin(players, eq(scores_table.player, players.osu_id))
		.where(and(eq(scores_table.playlist_item_id, playlistId)));

	return scores;
}

export { getOverallRoomScores, getPlaylistScores };
