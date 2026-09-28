import {
	getOverallRoomScores,
	getPlaylistScores,
} from "../functions/get-scores.js";
import {
	getRoomPlaylist,
	getPlaylistInfo,
} from "../functions/get-playlist-info.js";

async function MainPage({ queries }: { queries: Record<string, string> }) {
	const scores: {
		player_name: string;
		player_id: number;
		total_scores: number;
		score_id?: number;
		score_mods?: string;
		is_external?: boolean;
	}[] = [];

	let playlistName = "";
	const beatmapInfo = {
		beatmapId: 0,
		beatmapsetId: 0,
	};

	const playlistQuery = Number(queries?.playlist);
	const playlistRoom = await getRoomPlaylist(ROOM_ID);

	if (!isNaN(playlistQuery)) {
		const playlistInfo = await getPlaylistInfo(playlistQuery);
		playlistName = `${playlistInfo.beatmapset_artist} - ${playlistInfo.beatmapset_title} [${playlistInfo.beatmap_version}] | ${playlistInfo.beatmap_difficulty_rating}`;

		beatmapInfo.beatmapId = playlistInfo.beatmap_id;
		beatmapInfo.beatmapsetId = playlistInfo.beatmapset_id;

		const playlistScores = await getPlaylistScores(playlistQuery);
		playlistScores.forEach((s) => {
			scores.push({
				player_name: s.player_name || "-",
				player_id: s.player_id || 0,
				total_scores: s.total_scores,
				score_id: s.score_id,
				score_mods: s.score_mods || "",
				is_external: s.is_external || false,
			});
		});
	} else {
		const overallScores = await getOverallRoomScores(ROOM_ID);
		overallScores.forEach((s) => {
			scores.push({
				player_name: s.player_name || "-",
				player_id: s.player_id || 0,
				total_scores: Number(s.total_scores) || -1,
			});
		});
	}

	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Cirno Day Scores Tracker</title>
				<link rel="stylesheet" href="./assets/global.css?v=20260914" />
			</head>
			<body>
				<main>
					<div class="card">
						<div class="card__title">
							{playlistName ? playlistName : "Overall Scores"}
						</div>
						<div class="card__description">
							{playlistName ? (
								<>
									If your score is 0, that means it's not valid. You can fix it
									by playing{" "}
									<a
										href={`https://osu.ppy.sh/beatmapsets/${beatmapInfo.beatmapsetId}#osu/${beatmapInfo.beatmapId}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										the appropriate diff
									</a>
								</>
							) : (
								"Updates are done manually. Feel free to remind me to do it in osu chat."
							)}
						</div>
						<ol class="scores-list">
							{scores
								.toSorted((a, b) => {
									return b.total_scores - a.total_scores;
								})
								.map((s) => (
									<li class="score-item">
										<span>
											{new Intl.NumberFormat("en-US").format(s.total_scores)}
											{s.score_mods && ` (${s.score_mods})`}
											{s.is_external && ` (fetched externally)`}
											&nbsp;-&nbsp;
											<a
												href={`https://osu.ppy.sh/users/${s.player_id}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												{s.player_name}
											</a>
											{s.score_id && (
												<>
													&nbsp;-&nbsp;
													<a
														href={`https://osu.ppy.sh/scores/${s.score_id}`}
														target="_blank"
														rel="noopener noreferrer"
													>
														score link
													</a>
												</>
											)}
										</span>
									</li>
								))}
						</ol>
					</div>

					<div class="card">
						<div class="card__title">View other scores detail</div>
						<ul>
							<li>
								{playlistQuery ? (
									<a href={`./`}>Overall</a>
								) : (
									<span>
										<b>Overall</b>
									</span>
								)}
							</li>
							{playlistRoom.map((p) => {
								const playlistTitle = `${p.beatmapset_artist} - ${p.beatmapset_title} [${p.beatmap_version}] | ${p.beatmap_difficulty_rating}`;
								return (
									<li>
										{playlistQuery === p.playlist_item_id ? (
											<span>
												<b>{playlistTitle}</b>
											</span>
										) : (
											<a href={`./?playlist=${p.playlist_item_id}`}>
												{playlistTitle}
											</a>
										)}
									</li>
								);
							})}
						</ul>
					</div>

					<footer>
						<span>
							Open source. Check &nbsp;
							<a
								href="https://github.com/sukunnari/historical-daily-challenge-leaderboards.git"
								target="_blank"
								rel="noopener noreferrer"
							>
								GitHub
							</a>
							.
						</span>
					</footer>
				</main>
				<script
					type="text/javascript"
					src="./library/htmx.min.js?rev=20260912"
				></script>
			</body>
		</html>
	);
}

export { MainPage };
