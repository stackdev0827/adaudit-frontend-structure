export const formatDateWithUserPreferences = (isoString: string): string => {
	if (!isoString) return "-";

	try {
		const userTimezone = localStorage.getItem("timezone") || "UTC";
		const timeFormat = localStorage.getItem("timeformat") || "1";

		const date = new Date(isoString);

		// Convert to user's timezone with date and time
		const options: Intl.DateTimeFormatOptions = {
			timeZone: userTimezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false, // 24-hour format
		};

		if (timeFormat === "2") {
			// MM/DD/YYYY HH:MM:SS format
			const formattedDateTime = date.toLocaleString("en-US", options);
			return formattedDateTime;
		}

		// YYYY-MM-DD HH:MM:SS format
		const formattedDateTime = date.toLocaleString("sv-SE", options); // sv-SE gives YYYY-MM-DD HH:MM:SS
		return formattedDateTime;
	} catch (error) {
		console.error("Error formatting date:", error);
		return isoString;
	}
};
