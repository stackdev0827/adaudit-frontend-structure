import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg" | "xl";
	variant?: "spinner" | "dots" | "circle" | "shimmer";
	text?: string;
	className?: string;
	fullScreen?: boolean;
	overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = "md",
	variant = "spinner",
	text,
	className = "",
	fullScreen = false,
	overlay = false,
}) => {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-6 h-6",
		lg: "w-8 h-8",
		xl: "w-12 h-12",
	};

	const renderSpinner = () => {
		switch (variant) {
			case "spinner":
				return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;

			case "dots":
				return (
					<div className="flex space-x-1">
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
					</div>
				);

			case "circle":
				return (
					<div
						className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-blue-600`}
					></div>
				);

			default:
				return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
		}
	};

	const content = (
		<div className={`flex flex-col items-center justify-center ${className}`}>
			{renderSpinner()}
			{text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
		</div>
	);

	if (fullScreen) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50">
				{/* Pulsing logo */}
				<img
					src="/logo/1.svg"
					alt="Logo"
					className="w-80  mb-1 animate-[pulse_1.5s_ease-in-out_infinite]"
					style={{
						filter: "drop-shadow(0 0 16px #3b82f6aa)",
					}}
				/>
				{/* Shimmering progress bar with moving dot */}

				{/* Normal loading progress line */}
				<div className="relative w-64 h-1 bg-gray-200 rounded-full overflow-hidden mb-8">
					<div
						className="absolute left-0 top-0 h-full bg-blue-500 rounded-full animate-progress-bar"
						style={{ width: "40%" }}
					/>
					<style>
						{`
                            @keyframes progress-bar {
                                0% { left: -40%; width: 40%; }
                                50% { left: 30%; width: 60%; }
                                100% { left: 100%; width: 40%; }
                            }
                            .animate-progress-bar {
                                animation: progress-bar 1s cubic-bezier(.4,0,.2,1) infinite;
                            }
                        `}
					</style>
				</div>
				{/* <style>
					{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes moveDot {
                    0% { left: 0%; }
                    50% { left: 90%; }
                    100% { left: 0%; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.85; }
                }
                `}
				</style> */}
			</div>
		);
	}

	if (overlay) {
		return (
			<div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
				{content}
			</div>
		);
	}

	return content;
};

export default LoadingSpinner;
