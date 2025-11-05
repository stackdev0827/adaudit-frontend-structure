import { useState, ReactNode } from "react";
import {
	ChevronDown,
	// ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Filter,
	Info,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { cn } from "../../lib/utils";

interface ColumnHeaderProps {
	title: string | ReactNode;
	sortDirection?: "asc" | "desc" | null;
	onSort?: (direction: "asc" | "desc") => void;
	onFilter?: () => void;
	className?: string;
}

export const ColumnHeader = ({
	title,
	sortDirection,
	onSort,
	onFilter,
	className,
}: ColumnHeaderProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={cn(
						"h-auto p-0 font-medium text-xs text-gray-600 hover:bg-transparent justify-start font-normal",
						className
					)}
				>
					{typeof title === "string" ? <span>{title}</span> : title}
					<ChevronDown className="ml-1 h-3 w-3" />
					{sortDirection &&
						(sortDirection === "asc" ? (
							<ArrowUp className="ml-1 h-3 w-3" />
						) : (
							<ArrowDown className="ml-1 h-3 w-3" />
						))}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-48 bg-white border border-gray-200 shadow-lg z-50"
			>
				<DropdownMenuItem
					onClick={() => {
						onSort?.("desc");
						setIsOpen(false);
					}}
					className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
				>
					<ArrowDown className="h-4 w-4" />
					Sort descending
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						onSort?.("asc");
						setIsOpen(false);
					}}
					className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
				>
					<ArrowUp className="h-4 w-4" />
					Sort ascending
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						onFilter?.();
						setIsOpen(false);
					}}
					className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
				>
					<Filter className="h-4 w-4" />
					Filter
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-gray-50">
					<Info className="h-4 w-4" />
					About this metric
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
