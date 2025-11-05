import { AppDispatch } from "../store";
import { showToast } from "../slices/toastSlice";

export function handleTestSSE(dispatch: AppDispatch) {
	const evtSource = new EventSource(
		`${process.env.VITE_SERVER_ADDRESS}/api/v1/sse`
	);

	evtSource.onopen = function () {
		console.log("SSE connection opened");
	};

	evtSource.onmessage = function (event) {
		console.log("Message:", event.data);
	};

	evtSource.addEventListener("connection", function (event) {
		console.log("Test Complete:", event.data);
		dispatch(showToast({ message: "Wonderful! Success", type: "success" }));
		evtSource.close();
	});

	evtSource.addEventListener("hyros", function (event) {
		console.log("Hyros Error:", event.data);
		dispatch(showToast({ message: "Error Occur", type: "error" }));
		evtSource.close();
	});

	evtSource.onerror = function (err) {
		console.error("SSE error:", err);
	};
}
