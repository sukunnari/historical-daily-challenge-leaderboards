import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { trimTrailingSlash } from "hono/trailing-slash";
import { UtcAlarmManager } from "./utils/alarm.js";
import { jsxRenderer } from "hono/jsx-renderer";
import { MainPage } from "./components/main-page.js";

import { manageApi } from "./web-api/manage.js";
import { generalApi } from "./web-api/general.js";
import { OsuAPI } from "./osu-api.js";

const PORT = parseInt(`${process.env.SERVER_PORT}`);
if (isNaN(PORT)) {
	throw new Error("Please enter server port correctly!");
}

const app = new Hono();

app.use("*", trimTrailingSlash());

app.get("/manage", async (c) => {
	return c.redirect("./manage/");
});
app.route("/", manageApi);
app.route("/", generalApi);

app.use(
	"*",
	jsxRenderer(({ children }) => {
		return <>{children}</>;
	}),
);

app.get("/", async (c) => {
	return c.render(<MainPage queries={c.req.query()} />);
});

app.get(
	"/*",
	serveStatic({
		root: "./static/",
	}),
);

serve(
	{
		fetch: app.fetch,
		port: PORT,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);

const updatePlayersTimes: [number, number][] = [];
updatePlayersTimes.push([0, 10]);
updatePlayersTimes.push([0, 40]);
for (let i = 1; i <= 22; i++) {
	updatePlayersTimes.push([i, 1]);
	updatePlayersTimes.push([i, 35]);
}
updatePlayersTimes.push([23, 1]);
updatePlayersTimes.push([23, 45]);

const now = new Date();
updatePlayersTimes.push([now.getUTCHours(), now.getUTCMinutes() + 1]);
