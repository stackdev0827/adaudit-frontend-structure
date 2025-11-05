import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(value);
};

export const formatNumber = (value: number) => {
	return new Intl.NumberFormat("en-US").format(value);
};

export const formatPercentage = (value: number) => {
	return `${value.toFixed(2) || 0}`;
};
