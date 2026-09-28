import { API, Ruleset, APIError } from "osu-api-v2-js";
import { assertString, assertNumber } from "./utils/assert.js";
import { convertNumber } from "./utils/convert.js";
import { TimerManager } from "./utils/timer-manager.js";
import { ConsolePrefixed } from "./utils/console-prefixed.js";
const consolePref = new ConsolePrefixed("[Osu API]");

// Check whether these variables exist
const OSU_OWN_CLIENT_ID = process.env.OSU_OWN_CLIENT_ID;
const OSU_OWN_CLIENT_SECRET = process.env.OSU_OWN_CLIENT_SECRET;
if (!OSU_OWN_CLIENT_ID || !OSU_OWN_CLIENT_SECRET) {
	throw new Error(
		"Please configure these variables in the .env file: OSU_OWN_CLIENT_ID, OSU_OWN_CLIENT_SECRET",
	);
}

// Convert .env variables to their valid types
const ownClientId = convertNumber(OSU_OWN_CLIENT_ID);
const ownClientSecret = assertString(OSU_OWN_CLIENT_SECRET);

const OsuAPI = class {
	static #internalApi: API | null = null;

	static get #api() {
		if (OsuAPI.#internalApi === null) {
			throw new Error("API unavailable");
		}

		return OsuAPI.#internalApi;
	}

	static set #api(api: API) {
		OsuAPI.#internalApi = api;
	}

	static get expire() {
		return OsuAPI.#api.expires;
	}

	static generateApi = async function () {
		try {
			consolePref.info(`Generating API...`);
			const api = await API.createAsync(
				ownClientId,
				ownClientSecret,
				undefined,
				{ set_token_on_expires: false, set_token_on_401: false },
			);
			OsuAPI.#api = api;
		} catch (error) {
			TimerManager.addTimeout({
				name: "Retry Generate API",
				callback: OsuAPI.generateApi,
				time: 60000,
			});
			consolePref.error(error);
		}
	};

	static getUser = async function (user: string | number) {
		const data = await OsuAPI.#api.getUser(user, Ruleset.osu);
		return data;
	};

	static lookupUsers = async function (userIds: number[]) {
		if (userIds.length > 50) {
			throw new Error("Too many users to fetch for!");
		}
		const data = await OsuAPI.#api.lookupUsers(userIds);
		return data;
	};

	static getRoomInfo = async function (roomId: number) {
		return await OsuAPI.#api.getRoom(roomId);
	};

	static getPlaylistItemScores = async function (
		roomId: number,
		playlistId: number,
	) {
		return await OsuAPI.#api.getPlaylistItemScores({
			id: playlistId,
			room_id: roomId,
		});
	};

	static getUserStandardScoresOfBeatmap = async function (
		userId: number,
		beatmapId: number,
	) {
		return await OsuAPI.#api.getBeatmapUserScores(beatmapId, userId, {
			ruleset: Ruleset.osu,
		});
	};
};

OsuAPI.generateApi();

TimerManager.addInterval({
	name: "Hourly API generation",
	callback: OsuAPI.generateApi,
	time: 3600_000,
});

export { OsuAPI };
