// @ts-check
const pageState = {
	password: "",
};

document.querySelector("#form-password")?.addEventListener("submit", (e) => {
	e.preventDefault();
});

document.querySelector("#password")?.addEventListener("change", (e) => {
	pageState.password = e.target.value;
});

const formAddRoom = document.querySelector("#form-add-room");
formAddRoom?.addEventListener("submit", async (e) => {
	e.preventDefault();
	alert(
		"This will take a while, so please wait and don't interact with the page.",
	);
	try {
		const fd = new FormData(e.target);
		const res = await fetch("../api/manage/add-room", {
			method: "POST",
			body: JSON.stringify({
				room: fd.get("room-id"),
			}),
			headers: {
				"api-password": pageState.password,
			},
		});

		const resData = await res.json();
		if (resData?.success) {
			alert("Successfully added room");
		} else {
			alert(resData?.message || "Server error");
		}
	} catch (error) {
		alert("Error while fetching");
		console.error(error);
	}
});

const formAddRoomScores = document.querySelector("#form-add-room-scores");
formAddRoomScores?.addEventListener("submit", async (e) => {
	e.preventDefault();
	alert(
		"This will take a while, so please wait and don't interact with the page.",
	);
	try {
		const fd = new FormData(e.target);
		const res = await fetch("../api/manage/add-room-scores", {
			method: "POST",
			body: JSON.stringify({
				room: fd.get("room-id"),
			}),
			headers: {
				"api-password": pageState.password,
			},
		});

		const resData = await res.json();
		if (resData?.success) {
			alert("Scores successfully retrieved");
		} else {
			alert(resData?.message || "Server error");
		}
	} catch (error) {
		alert("Error while fetching");
		console.error(error);
	}
});
