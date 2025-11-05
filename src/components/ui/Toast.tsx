import React from "react";
// Update the import path if the file is located elsewhere, for example:
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
// Update the import path below if toastSlice is located elsewhere
import { hideToast } from "../../slices/toastSlice";

const Toast: React.FC = () => {
	const { open, message, type } = useAppSelector((state) => state.toast);
	const dispatch = useAppDispatch();

	if (!open) return null;

	let bgColor = "bg-blue-600";
	if (type === "success") bgColor = "bg-green-600";
	if (type === "error") bgColor = "bg-red-600";
	if (type === "warning") bgColor = "bg-yellow-500";

	return (
		<div
			className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${bgColor}`}
			style={{ minWidth: 300, textAlign: "center" }}
			onClick={() => dispatch(hideToast())}
			role="alert"
		>
			{message}
		</div>
	);
};

export default Toast;
