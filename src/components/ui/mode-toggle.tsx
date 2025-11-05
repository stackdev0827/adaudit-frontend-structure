import { Moon, Sun } from "lucide-react";
import { Button } from "@tremor/react";
// removed unused dropdown imports to avoid warnings/errors
import { useTheme } from "../../hooks/theme-provider";

export function ModeToggle() {
	const { setTheme } = useTheme();

	return (
		<div className="flex items-center space-x-2">
			<Button
				variant="secondary"
				aria-label="Light theme"
				onClick={() => setTheme("light")}
			>
				<Sun className="h-5 w-5" />
			</Button>

			<Button
				variant="secondary"
				aria-label="Dark theme"
				onClick={() => setTheme("dark")}
			>
				<Moon className="h-5 w-5" />
			</Button>

			<Button
				size="sm"
				variant="secondary"
				aria-label="System theme"
				onClick={() => setTheme("system")}
			>
				System
			</Button>
		</div>
	);
}
