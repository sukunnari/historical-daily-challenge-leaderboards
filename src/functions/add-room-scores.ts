import { OsuAPI } from "../osu-api.js";
import { db } from "../database/db.js";
import { eq, and } from "drizzle-orm";
import {
	rooms,
	playlist_items,
	scores as scores_table,
	players,
} from "../database/schema.js";
import { ConsolePrefixed } from "../utils/console-prefixed.js";

const consolePref = new ConsolePrefixed("[addRoomScores]");

async function addRoomScores(
	roomId: number,
): Promise<{ success: boolean; message?: string; suggestedHttpCode?: number }> {
	const room = await db.select().from(rooms).where(eq(rooms.room_id, roomId));

	if (room.length < 1) {
		return {
			success: false,
			message: "Room not found, please add it first",
			suggestedHttpCode: 404,
		};
	}

	const playlist = await db
		.select()
		.from(playlist_items)
		.where(eq(playlist_items.room_id, roomId));

	if (playlist.length < 1) {
		return {
			success: false,
			message: "Playlist item(s) not found, you might want to re-add the room",
			suggestedHttpCode: 404,
		};
	}

	for (let i_playlist = 0; i_playlist < playlist.length; i_playlist++) {
		const playlistItem = playlist[i_playlist];
		const playlist_item_id = playlistItem.playlist_item_id;
		consolePref.info(
			`== Inserting for playlist #${playlist_item_id}: ${playlistItem.beatmapset_title} - ${playlistItem.beatmapset_artist} | ${playlistItem.beatmap_id} ==`,
		);

		const playlistItemScores = await OsuAPI.getPlaylistItemScores(
			roomId,
			playlist_item_id,
		);
		const scoresApiInfo = playlistItemScores.scores;

		if (scoresApiInfo.length < 1) {
			continue;
		}

		const existingScores = await db
			.select()
			.from(scores_table)
			.where(eq(scores_table.playlist_item_id, playlist_item_id));
		if (existingScores.length > 0) {
			await db
				.delete(scores_table)
				.where(eq(scores_table.playlist_item_id, playlist_item_id));
		}

		// Insert all scores
		for (let i_scores = 0; i_scores < scoresApiInfo.length; i_scores++) {
			const score = scoresApiInfo[i_scores];

			// First, insert/update player
			const existingPlayer = (
				await db.select().from(players).where(eq(players.osu_id, score.user_id))
			)[0];
			if (existingPlayer) {
				await db
					.update(players)
					.set({
						name: score.user.username,
					})
					.where(eq(players.osu_id, score.user_id));
			} else {
				await db.insert(players).values({
					osu_id: score.user_id,
					name: score.user.username,
				});
			}

			// Then, we can insert the score
			// Since it contains reference to players' table

			// ...But we can't just insert it
			// Because there are other players who picked different diff
			// So let's check the diff first
			const now = new Date();
			if (score.beatmap_id === playlistItem.beatmap_id) {
				consolePref.info(
					`Inserting score #${score.id} of ${score.user.username}`,
				);
				// Add user who (obviously) played the same diff
				await db.insert(scores_table).values({
					score_id: score.id,
					playlist_item_id: playlist_item_id,
					player: score.user_id,
					value: score.total_score,
					mods: score.mods
						.map((m) => `${m.acronym}${m.settings ? "*" : ""}`)
						.join(", "),
					external_source: false,
					created: now,
				});
			} else {
				consolePref.info(
					`Searching for external score of ${score.user.username}`,
				);
				// Search their score on this diff using the api
				const allUserScoresOnTheDiff =
					await OsuAPI.getUserStandardScoresOfBeatmap(
						score.user_id,
						playlistItem.beatmap_id,
					);
				const filteredUserScores = allUserScoresOnTheDiff
					.filter((s) => {
						const endDate = room[0].end_date
							? room[0].end_date
							: new Date(room[0].start_date.getTime() + 14 * 24 * 3600 * 1000);
						if (s.ended_at >= room[0].start_date && s.ended_at <= endDate) {
							return true;
						} else {
							return false;
						}
					})
					.toSorted((a, b) => b.total_score - a.total_score);
				const userScore = filteredUserScores[0];
				if (userScore) {
					consolePref.info(`Inserting score #${userScore.id}`);
					await db.insert(scores_table).values({
						score_id: userScore.id,
						playlist_item_id: playlist_item_id,
						player: userScore.user_id,
						value: userScore.total_score,
						mods: userScore.mods
							.map((m) => `${m.acronym}${m.settings ? "*" : ""}`)
							.join(", "),
						external_source: true,
						created: now,
					});
				} else {
					consolePref.info(
						`External scores not found, inserting 0 score instead`,
					);
					await db.insert(scores_table).values({
						score_id: score.id,
						playlist_item_id: playlist_item_id,
						player: score.user_id,
						value: 0,
						mods: score.mods
							.map((m) => `${m.acronym}${m.settings ? "*" : ""}`)
							.join(", "),
						external_source: false,
						created: now,
					});
				}
			}
		}
	}

	return {
		success: true,
	};
}

export { addRoomScores };
