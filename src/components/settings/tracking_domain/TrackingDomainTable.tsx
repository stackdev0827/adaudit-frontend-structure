import { useState, useEffect } from "react";
import { Card, Title, Text, Button } from "@tremor/react";
import { trackingDomainApi } from "../../../services/api";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../../pages/reports/ui/table";
import { Badge } from "../../../pages/reports/ui/badge";
import { CardContent, CardHeader } from "../../../pages/reports/ui/card";
import { AddDomainModal } from "./AddDomainModal";
import LoadingSpinner from "../../ui/LoadingSpinner";
// import { formatDistanceToNow } from "date-fns";
import { Copy } from "lucide-react";

// Notification component
const Notification = ({
	message,
	type,
	onClose,
}: {
	message: string;
	type: "success" | "error";
	onClose: () => void;
}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, 3000);

		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<div
			className={`absolute top-2 right-6 z-9999 px-4 py-2 rounded shadow-lg text-white ${
				type === "success" ? "bg-green-600" : "bg-red-600"
			}`}
		>
			<span>{message}</span>
			<button className="ml-4 text-white font-bold" onClick={onClose}>
				&times;
			</button>
		</div>
	);
};

interface TrackingDomain {
	id: string;
	domain: string;
	tr_domain: string;
	tracking_script_name: string;
	tracking_script_url: string;
	dns_status: number;
	ssl_status: number;
	ns_records: any;
}

export const TrackingDomainTable = () => {
	const [domains, setDomains] = useState<TrackingDomain[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [step, setStep] = useState("domain");
	const [domain, setDomain] = useState<TrackingDomain>();
	// const [continueDomain, setContinueDomain] = useState<TrackingDomain | null>(
	// 	null
	// );
	// const [editingId, setEditingId] = useState<string | null>(null);
	const [expandedScriptIds, setExpandedScriptIds] = useState<string[]>([]);
	// const [editValues, setEditValues] = useState<{ tracking_name: string }>({
	// 	tracking_name: "",
	// });
	// const [dnsRecords, setDnsRecords] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusLoading, setStatusLoading] = useState<string[]>([]); // Track which domains are loading status
	const [deleteLoading, setDeleteLoading] = useState<string[]>([]);
	// const [currentTime, setCurrentTime] = useState(Date.now());
	const [notification, setNotification] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	useEffect(() => {
		fetchDomains();
	}, []);

	const fetchDomains = async () => {
		try {
			const response = await trackingDomainApi.getAll();
			setDomains(response.data);

			// Set all domains as loading status initially
			setStatusLoading(
				response.data.map((domain: TrackingDomain) => domain.id)
			);

			fetchDomainStatus(response.data);
		} catch (error) {
			console.error("Error fetching domains:", error);
			setNotification({
				message: "Failed to load domains",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchDomainStatus = async (domains: TrackingDomain[]) => {
		try {
			console.log(
				"------ Start  ------",
				import.meta.env.VITE_SERVER_ADDRESS
			);
			const domainIds = domains.map((domain) => domain.id).join(",");

			const eventSource = new EventSource(
				`${
					import.meta.env.VITE_SERVER_ADDRESS
				}/admin/tracking-domain/status?tracking_domain_ids=${domainIds}`
			);

			eventSource.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);

					// Update the specific domain's status
					setDomains((prevDomains) =>
						prevDomains.map((domain) =>
							domain.id === data.tracking_domain_id
								? {
										...domain,
										dns_status: data.ns_verification.status,
										ssl_status:
											data.ssl_verification.status,
								  }
								: domain
						)
					);

					// Remove this domain from loading status
					setStatusLoading((prev) =>
						prev.filter((id) => id !== data.tracking_domain_id)
					);
				} catch (error) {
					console.error("Error parsing SSE data:", error);
				}
			};

			eventSource.addEventListener("complete", (event) => {
				setStatusLoading([]); // Clear all loading states
				eventSource.close();
			});

			eventSource.onerror = (error) => {
				console.error("SSE error:", error);
				setStatusLoading([]); // Clear loading states on error
				eventSource.close();
			};
		} catch (error) {
			console.log(error);
			setStatusLoading([]); // Clear loading states on error
		}
	};

	const handleDelete = async (id: string) => {
		setDeleteLoading([id]);
		try {
			await trackingDomainApi.delete(Number(id));

			setDomains(domains.filter((domain) => domain.id !== id));
			setNotification({
				message: "Domain deleted successfully",
				type: "success",
			});
		} catch (error) {
			console.error("Error deleting domain:", error);
			setNotification({
				message: "Failed to delete domain",
				type: "error",
			});
		} finally {
			setDeleteLoading([]);
		}
	};

	const handleCopyScript = (trackingScriptUrl: string) => {
		const script = `<script src="${trackingScriptUrl}"></script>`;
		navigator.clipboard.writeText(script);
		setNotification({
			message: "Tracking script copied to clipboard",
			type: "success",
		});
	};

	const handleAddDomain = () => {
		console.log("------------------");
	};

	const handleStepChange = (step: string) => {
		setStep(step);
		fetchDomains();
	};

	// if (loading) {
	// 	return (
	// 		// <div className="space-y-6">
	// 		// 	<Card>
	// 		// 		<CardContent className="p-6">
	// 		// 			<div className="text-center">Loading domains...</div>
	// 		// 		</CardContent>
	// 		// 	</Card>
	// 		// </div>
	// 		<LoadingSpinner />
	// 	);
	// }

	return (
		<div>
			<div>
				<Title>Tracking Domain</Title>
				<Text>View and manage tracking domain</Text>
			</div>
			<Card className="mt-2">
				<CardHeader className="flex flex-row items-center justify-end">
					<Button
						onClick={() => {
							// setContinueDomain(null);
							setStep("");
							setIsModalOpen(true);
						}}
					>
						Add Domain
					</Button>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tracking Domain Name</TableHead>
								<TableHead>Domain</TableHead>
								<TableHead>DNS Status</TableHead>
								<TableHead>SSL Status</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{domains.map((domain, index) => (
								<>
									<TableRow key={`${domain.id} - ${index}`}>
										<TableCell>
											<div className="text-foreground">
												{domain.tracking_script_name}
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium">
												{domain.tr_domain}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												{statusLoading.includes(
													domain.id
												) ? (
													<Badge variant="secondary">
														Loading...
													</Badge>
												) : (
													<Badge
														className={
															domain.dns_status ===
															0
																? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
																: "bg-green-100 text-green-700 hover:bg-green-100"
														}
													>
														{domain.dns_status === 1
															? "Verified"
															: "Pending"}
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												{statusLoading.includes(
													domain.id
												) ? (
													<Badge variant="secondary">
														Loading...
													</Badge>
												) : (
													<Badge
														className={
															domain.ssl_status ===
															1
																? "bg-green-100 text-green-700 hover:bg-green-100"
																: domain.ssl_status ===
																  0
																? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
																: "bg-red-100 text-red-700 hover:bg-red-100"
														}
													>
														{domain.ssl_status === 1
															? "Valid"
															: domain.ssl_status ===
															  0
															? "Pending"
															: "-"}
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="sm"
													onClick={() => {
														const isExpanded =
															expandedScriptIds.includes(
																domain.id
															);
														if (isExpanded) {
															setExpandedScriptIds(
																expandedScriptIds.filter(
																	(id) =>
																		id !==
																		domain.id
																)
															);
														} else {
															setExpandedScriptIds(
																[
																	...expandedScriptIds,
																	domain.id,
																]
															);
														}
													}}
												>
													<div className="flex gap-2">
														<Copy className="h-4 w-4" />
														{expandedScriptIds.includes(
															domain.id
														)
															? "Hide"
															: "Show"}{" "}
														Script
													</div>
												</Button>

												{/* Only show Set Up Tracking Domain button when DNS is not verified OR SSL is not active */}
												{!statusLoading.includes(
													domain.id
												) &&
													domain.dns_status !== 1 &&
													domain.ssl_status !== 1 && (
														<Button
															size="sm"
															onClick={() => {
																// Handle setup tracking domain
																setIsModalOpen(
																	true
																);
																const status =
																	domain.dns_status ===
																	0
																		? "verify"
																		: "ssl";
																setStep(status);
																setDomain(
																	domain
																);
															}}
														>
															Set Up Tracking
															Domain
														</Button>
													)}

												<Button
													size="sm"
													onClick={() =>
														handleDelete(domain.id)
													}
												>
													{deleteLoading.includes(
														domain.id
													)
														? "loading..."
														: "Delete"}
												</Button>
											</div>
										</TableCell>
									</TableRow>
									{expandedScriptIds.includes(domain.id) && (
										<TableRow>
											<TableCell
												colSpan={5}
												className="bg-muted/30"
											>
												<div className="py-4 space-y-3">
													<div className="flex items-center justify-between">
														<h4 className="font-medium">
															Tracking Script
														</h4>
														{/* {domain.dns_status ===
															1 &&
														(domain.ssl_status ===
															4 ||
															domain.ssl_status ===
																3) ? (
															<Badge
																variant="secondary"
																className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
															>
																Ready to use
															</Badge>
														) : (
															<Badge variant="destructive">
																NOT READY
															</Badge>
														)} */}
													</div>
													<p className="text-sm text-muted-foreground">
														Add this script to the
														header section of each
														page you want tracked.
													</p>
													<div className="bg-background p-3 rounded border font-mono text-sm">
														{`<script src="${domain.tracking_script_url}"></script>`}
													</div>
													<Button
														size="sm"
														onClick={() =>
															handleCopyScript(
																domain.tracking_script_url
															)
														}
													>
														<div className="flex gap-2">
															<Copy className="h-4 w-4" />
															Copy Script
														</div>
													</Button>
												</div>
											</TableCell>
										</TableRow>
									)}
								</>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			{loading && (
				<LoadingSpinner
					fullScreen
					text="Loading user journey data..."
					size="lg"
				/>
			)}

			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
					onClose={() => setNotification(null)}
				/>
			)}

			<AddDomainModal
				open={isModalOpen}
				onOpenChange={(open) => {
					setIsModalOpen(open);
				}}
				onAddDomain={handleAddDomain}
				steps={step}
				selectedDomain={domain || {}}
				onStepsChange={handleStepChange}
			/>
		</div>
	);
};
