import { useEffect, useState } from "react";
import { trackingDomainApi } from "../../../services/api";
import { Button } from "../../../pages/reports/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../../../pages/reports/ui/dialog";
import { Check, Copy, Loader2 } from "lucide-react";
import { Input } from "../../../pages/reports/ui/input";
import { Label } from "../../../pages/reports/ui/label";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../pages/reports/ui/card";
// import { Badge } from "../../../pages/reports/ui/badge";
interface AddDomainModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAddDomain: (
		trackingName: string,
		domain: string,
		subdomain: string
	) => void;
	selectedDomain?: any;
	steps: string;
	onStepsChange: (step: string) => void;
}
type Step = "domain" | "subdomain" | "verify" | "ssl" | "completed";
// interface DNSRecord {
// 	type: string;
// 	name: string;
// 	value: string;
// 	ttl: string;
// }
export const AddDomainModal = ({
	open,
	onOpenChange,
	onAddDomain,
	steps,
	selectedDomain,
	onStepsChange,
}: // existingDomains = [],
// continueDomain,
AddDomainModalProps) => {
	const [step, setStep] = useState<string>("domain");
	const [nextLoading, setnextLoading] = useState(false);
	const [trackingName, setTrackingName] = useState("");
	const [domain, setDomain] = useState("");
	const [useCustomSubdomain, setUseCustomSubdomain] = useState(false);
	const [subdomain, setSubdomain] = useState("");
	const [domainId, setDomainId] = useState<any>({});
	const [isGenerating, setIsGenerating] = useState(false);
	// const [verificationStatus, setVerificationStatus] = useState("verified");
	const [loading, setLoading] = useState(false);
	const [dnsStatus, setDNSStatus] = useState("");
	const [sslStatus, setSSLStatus] = useState("");
	const [nsRecords, setNSRecords] = useState([]);
	const [recordsAdded, setRecordsAdded] = useState(false);
	const [copiedRecord, setCopiedRecord] = useState<string | null>(null);

	useEffect(() => {
		console.log(steps, selectedDomain);
		if (steps === "") {
			setStep("domain");
		} else {
			console.log(steps);
			setStep(steps);
		}
	}, [open]);

	const verifyDNS = async (id: string) => {
		console.log(id);
		setLoading(true);
		try {
			const response = await trackingDomainApi.verifyDNS(id);
			setDNSStatus(response.data.status);
			// if (response.data.status === "success") {
			// 	onStepsChange("ssl");
			// }
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const checkSSL = async (id: string) => {
		setLoading(true);
		try {
			const response = await trackingDomainApi.checkSSL(id);
			setSSLStatus(response.data.status);
			// if (response.data.status === "success") {
			// 	onStepsChange("completed");
			// }
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const getStepTitle = () => {
		switch (step) {
			case "domain":
				return "Add Tracking Domain";
			case "subdomain":
				return "Configure Subdomain";
			case "verify":
				return "Verify DNS";
			case "ssl":
				return "SSL Certificate Check";
			default:
				return "Add Tracking Domain";
		}
	};

	const handleNext = async () => {
		if (step === "domain") {
			// if (!trackingName.trim() || !domain.trim()) {
			// 	// toast({
			// 	// 	title: "Error",
			// 	// 	description: "Please fill in all required fields",
			// 	// 	variant: "destructive",
			// 	// });
			// 	return;
			// }
			setStep("subdomain");
			// Auto-generate subdomain when entering step 2
			if (!useCustomSubdomain && !subdomain) {
				generateRandomSubdomain();
			}
		} else if (step === "subdomain") {
			setnextLoading(true);
			try {
				const response = await trackingDomainApi.createDomain({
					tracking_script_name: trackingName,
					domain: domain,
					tr_domain: subdomain,
				});
				console.log(response.data);
				onStepsChange("verify");
				setDomainId(response.data);
				setNSRecords(response.data.ns_records);
				setStep("verify");
			} catch (error) {
				console.log("----------");
			} finally {
				setnextLoading(false);
			}
		} else if (step === "verify") {
			onStepsChange("ssl");
			setStep("ssl");
		} else if (step === "ssl") {
			onStepsChange("completed");
			setStep("completed");
		} else {
			setStep("domain");
			setTrackingName("");
			setDomain("");
			setSubdomain("");
			setUseCustomSubdomain(false);
			setIsGenerating(false);
			onOpenChange(false);
		}
	};

	const handleBack = () => {
		if (step === "subdomain") setStep("domain");
		else if (step === "verify") setStep("subdomain");
		else if (step === "ssl") setStep("verify");
	};

	const handleClose = () => {
		setStep("domain");
		setTrackingName("");
		setDomain("");
		setSubdomain("");
		setNSRecords([]);
		setUseCustomSubdomain(false);
		setIsGenerating(false);
		onOpenChange(false);
	};

	const generateRandomSubdomain = async () => {
		setIsGenerating(true);

		try {
			const response = await trackingDomainApi.generatedSubdomain();
			setSubdomain(response.data.subdomain);
		} catch (error) {
			// No existing domain found, which is good
			console.log(
				"No existing domain found, continuing with subdomain generation"
			);
		}

		setIsGenerating(false);
	};

	const handleCopyRecord = async (value: string, recordId: string) => {
		await navigator.clipboard.writeText(value);
		setCopiedRecord(recordId);
		setTimeout(() => setCopiedRecord(null), 2000);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">
						{getStepTitle()}
					</DialogTitle>
				</DialogHeader>

				<div className="flex items-center">
					{(
						[
							"domain",
							"subdomain",
							"verify",
							"ssl",
							"completed",
						] as Step[]
					).map((stepName, index) => {
						const currentIndex = [
							"domain",
							"subdomain",
							"verify",
							"ssl",
							"completed",
						].indexOf(steps === "" ? step : steps);
						const stepIndex = index;
						const isActive = stepIndex === currentIndex;
						const isCompleted = stepIndex < currentIndex;
						return (
							<div
								key={stepName}
								className="flex items-center flex-1"
							>
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
										isCompleted
											? "bg-[#158e44] text-white"
											: isActive
											? "bg-[#158e44] text-white"
											: "bg-muted text-muted-foreground"
									}`}
								>
									{stepIndex + 1}
								</div>
								{index < 4 && (
									<div
										className={`flex-1 h-0.5 mx-2 ${
											isCompleted
												? "bg-[#158e44]"
												: "bg-muted"
										}`}
									/>
								)}
							</div>
						);
					})}
				</div>
				{step === "domain" && (
					<>
						<div className="space-y-4">
							<div>
								<Label htmlFor="trackingName">
									Tracking Script Name
								</Label>
								<p className="text-sm text-muted-foreground mt-1 mb-2">
									This is the name to reference the script.
								</p>
								<Input
									id="trackingName"
									value={trackingName}
									onChange={(e) =>
										setTrackingName(e.target.value)
									}
									placeholder="Enter a name for this tracking domain"
								/>
							</div>

							<div>
								<Label htmlFor="domain">Domain</Label>
								<p className="text-sm text-muted-foreground mt-1 mb-2">
									Enter the main domain that the site is on.
									Even if it is a subdomain enter the main
									domain of the website.
								</p>
								<Input
									id="domain"
									value={domain}
									onChange={(e) => setDomain(e.target.value)}
									placeholder="example.com"
								/>
							</div>
						</div>
					</>
				)}
				{step === "subdomain" && (
					<div className="space-y-4">
						<div>
							<Label>Subdomain Configuration</Label>
							<p className="text-sm text-muted-foreground mt-1">
								Choose how you want to configure your subdomain
								for {domain}
							</p>
						</div>

						<div className="space-y-3">
							<Card
								className={`cursor-pointer transition-all ${
									!useCustomSubdomain
										? "ring-2 ring-primary"
										: ""
								}`}
							>
								<CardContent className="p-4">
									<div
										className="flex items-center space-x-3"
										onClick={() => {
											setUseCustomSubdomain(false);
										}}
									>
										<input
											type="radio"
											checked={!useCustomSubdomain}
											onChange={() =>
												setUseCustomSubdomain(false)
											}
											className="w-4 h-4"
										/>
										<div className="flex-1">
											<div className="font-medium">
												Auto-generate subdomain
												(Recommended)
											</div>
											<div className="text-sm text-muted-foreground">
												We'll create a unique subdomain
												for you
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card
								className={`cursor-pointer transition-all ${
									useCustomSubdomain
										? "ring-2 ring-primary"
										: ""
								}`}
							>
								<CardContent className="p-4">
									<div
										className="flex items-center space-x-3"
										onClick={() =>
											setUseCustomSubdomain(true)
										}
									>
										<input
											type="radio"
											checked={useCustomSubdomain}
											onChange={() =>
												setUseCustomSubdomain(true)
											}
											className="w-4 h-4"
										/>
										<div className="flex-1">
											<div className="font-medium">
												Custom subdomain
											</div>
											<div className="text-sm text-muted-foreground">
												Enter your own subdomain
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{!useCustomSubdomain && (
							<div className="space-y-3">
								{subdomain && (
									<div className="p-3 bg-muted rounded-lg">
										<div className="text-sm font-medium">
											Generated subdomain:
										</div>
										<div className="flex items-center justify-between mt-1">
											<div className="text-lg font-mono">
												{subdomain}.{domain}
											</div>
											<Button
												onClick={
													generateRandomSubdomain
												}
												disabled={isGenerating}
												variant="outline"
												size="sm"
											>
												{isGenerating ? (
													<>
														<Loader2 className="w-3 h-3 mr-1 animate-spin" />
														Generating...
													</>
												) : (
													"Regenerate"
												)}
											</Button>
										</div>
									</div>
								)}
							</div>
						)}

						{useCustomSubdomain && (
							<div>
								<Label htmlFor="customSubdomain">
									Custom Subdomain
								</Label>
								<div className="mt-1 flex items-center">
									<Input
										id="customSubdomain"
										value={subdomain}
										onChange={(e) =>
											setSubdomain(e.target.value)
										}
										placeholder="tracking"
										className="rounded-r-none"
									/>
									<div className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm">
										.{domain}
									</div>
								</div>
							</div>
						)}
					</div>
				)}
				{step === "verify" && (
					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-medium">
								DNS Configuration
							</h3>
							<p className="text-sm text-muted-foreground">
								Add the following nameserver records to your
								domain provider.
							</p>
						</div>

						<div className="text-sm font-bold">
							<p>
								Required NS Records (
								{selectedDomain.ns_records
									? selectedDomain.ns_records.length
									: nsRecords.length}{" "}
								records)
							</p>
						</div>

						<Card>
							<CardContent className="p-4">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="w-full">
											{/* <div className="font-medium border-b-2 py-2">
												Domain:{" "}
												{selectedDomain.tr_domain ||
													domainId.domain}
											</div> */}
											<div className="text-sm text-muted-foreground mt-[20px] space-y-2 ">
												{selectedDomain.ns_records
													? selectedDomain.ns_records.map(
															(
																domain: string
															) => (
																<div className="border border-2 p-2">
																	<div className="flex items-center gap-2 mb-1">
																		<span className="text-xs p-1 border rounded-md font-bold mr-2">
																			NS
																		</span>
																		<span className="text-md font-bold">
																			Record
																		</span>
																	</div>
																	<div className="mb-1 flex items-center justify-between">
																		<span>
																			Name:{" "}
																			{selectedDomain.tr_domain.replace(
																				`.${selectedDomain.domain}`,
																				""
																			)}
																		</span>
																		<button
																			onClick={() =>
																				handleCopyRecord(
																					selectedDomain.tr_domain.replace(
																						`.${selectedDomain.domain}`,
																						""
																					),
																					`name-${domain}`
																				)
																			}
																			className="p-1 hover:bg-gray-100 rounded"
																			title="Copy Name"
																		>
																			{copiedRecord ===
																			`name-${domain}` ? (
																				<Check className="w-4 h-4 text-green-500" />
																			) : (
																				<Copy className="w-4 h-4 text-gray-500" />
																			)}
																		</button>
																	</div>
																	<div className="flex items-center justify-between">
																		<span>
																			Value:{" "}
																			{
																				domain
																			}
																		</span>
																		<button
																			onClick={() =>
																				handleCopyRecord(
																					domain,
																					`value-${domain}`
																				)
																			}
																			className="p-1 hover:bg-gray-100 rounded"
																			title="Copy Value"
																		>
																			{copiedRecord ===
																			`value-${domain}` ? (
																				<Check className="w-4 h-4 text-green-500" />
																			) : (
																				<Copy className="w-4 h-4 text-gray-500" />
																			)}
																		</button>
																	</div>
																</div>
															)
													  )
													: nsRecords.map(
															(
																domain: string
															) => (
																<div
																	className="border border-2 p-2"
																	key={domain}
																>
																	<div>
																		Name:{" "}
																		{
																			domainId.domain.split(
																				"."
																			)[0]
																		}
																	</div>
																	<div>
																		Value:{" "}
																		{domain}
																	</div>
																</div>
															)
													  )}
											</div>
										</div>
									</div>
									<div className="space-y-4">
										<div className="flex items-start space-x-3 pt-4 bg-muted/50 rounded-lg">
											<input
												type="checkbox"
												id="recordsAdded"
												checked={recordsAdded}
												onChange={(e) =>
													setRecordsAdded(
														e.target.checked
													)
												}
												className="w-4 h-4 mt-0.5"
											/>
											<label
												htmlFor="recordsAdded"
												className="text-sm cursor-pointer"
											>
												<div className="font-medium">
													I have added the required
													DNS records
												</div>
												<div className="text-muted-foreground text-xs mt-1">
													Check this box once you've
													added the CNAME record to
													your domain's DNS settings
												</div>
											</label>
										</div>
									</div>

									<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
										<div className="text-sm">
											<div className="font-medium text-blue-900 mb-1">
												Important:
											</div>
											<ul className="list-disc list-inside text-blue-800 space-y-1">
												<li>
													DNS changes can take up to
													48 hours to propagate
													globally
												</li>
												<li>
													Some providers may take
													longer than others
												</li>
												<li>
													You can proceed to
													verification once you've
													added the records
												</li>
											</ul>
										</div>
									</div>
									{loading ? (
										<Button
											className="w-full"
											variant={"outline"}
											onClick={() => {
												verifyDNS(
													domainId.id !== undefined
														? domainId.id.toString()
														: selectedDomain.id
												);
											}}
										>
											<Loader2 className="w-4 h-4 animate-spin" />
											<span className="ml-2 text-sm">
												Verifying...
											</span>
										</Button>
									) : (
										<Button
											className="w-full"
											variant={"outline"}
											onClick={() => {
												console.log(domainId.id);
												verifyDNS(
													domainId.id !== undefined
														? domainId.id.toString()
														: selectedDomain.id
												);
											}}
											disabled={
												dnsStatus === "success" ||
												recordsAdded === false
											}
										>
											{dnsStatus === "success"
												? "Success"
												: "Verify DNS Records"}
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
				{step === "ssl" && (
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">
									SSL Certificate Verification
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<div className="font-medium">
											Domain:{" "}
											{selectedDomain.tr_domain ||
												domainId.domain}
										</div>
										<div className="text-sm text-muted-foreground">
											SSL certificate verification
										</div>
									</div>
									{/* <Badge variant={"secondary"}>Not Checked</Badge> */}
								</div>

								<div className="flex flex-col gap-2">
									{loading ? (
										<Button
											className="w-full"
											variant={"outline"}
											onClick={() =>
												checkSSL(
													selectedDomain.id ||
														domainId.id
												)
											}
										>
											<Loader2 className="w-4 h-4 animate-spin" />
											<span className="ml-2 text-sm">
												Verifying...
											</span>
										</Button>
									) : (
										<Button
											className="w-full"
											variant={"outline"}
											onClick={() =>
												checkSSL(
													selectedDomain.id ||
														domainId.id
												)
											}
											disabled={sslStatus === "success"}
										>
											{sslStatus === "success"
												? "Success"
												: "Check SSL Now"}
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
				{step === "completed" && (
					<div className="text-center py-4">
						<div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100">
							<Check className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-2xl font-bold mb-2">
							Your Tracking Domain
						</h3>
						<div className="flex items-center justify-center gap-2">
							{/* <span className="font-mono font-semibold">
								{subdomain}.{domain}
							</span> */}
							{/* <Badge variant={"default"}>READY</Badge> */}
						</div>
					</div>
				)}

				{step === "subdomain" ? (
					<div className="flex justify-between pt-4 border-t">
						<Button variant="outline" onClick={handleBack}>
							Back
						</Button>

						<Button
							variant={"outline"}
							onClick={handleNext}
							disabled={step === "subdomain" && !subdomain.trim()}
						>
							{nextLoading ? "Loading..." : "Next"}
						</Button>
					</div>
				) : (
					<div className="flex justify-end pt-4 border-t">
						<Button
							variant={"outline"}
							onClick={handleNext}
							disabled={
								(step === "domain" &&
									(!trackingName.trim() || !domain.trim())) ||
								(step === "verify" &&
									dnsStatus !== "success") ||
								(step === "ssl" && sslStatus !== "success")
							}
						>
							{step === "completed" ? "Finish" : "Next"}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
