import React, { useEffect, useState } from "react";
import {
	TextInput,
	Button,
	Table,
	TableHead,
	TableRow,
	TableHeaderCell,
	TableBody,
	TableCell,
	Badge,
	Card,
	Title,
	Text,
	Dialog,
	DialogPanel,
} from "@tremor/react";
import { trackingDomainApi } from "../../../services/api";
import { Trash2 } from "lucide-react";
// import AddTrackingDomainDialog from "./AddTrackingDomainDialog";

interface TrackingDomain {
	id: number;
	domain: string;
	tr_domain: string;
	portal_domain: string;
	created_at: string;
}

interface DomainForm {
	domain: string;
	trDomain: string;
	portalDomain: string;
}

const TrackingDomainsCopy: React.FC = React.memo(() => {
	const [domains, setDomains] = useState<TrackingDomain[]>([]);
	const [formData, setFormData] = useState<DomainForm>({
		domain: "",
		trDomain: "",
		portalDomain: "",
	});
	const [error, setError] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// const [trStatus, setTrStatus] = useState(false);
	const [mainDomain, setMainDomain] = useState("");
	const [trackingDomainList, setTrackingDomainList] = useState<any[]>([]);
	const [setupResultList, setSetUpResultList] = useState<any[]>([]);
	const [setupResult, setSetUpResult] = useState("");
	const [isFetchingTrackingDomains, setIsFetchingTrackingDomains] =
		useState(false); // Add loading state
	const [selectedDialog, setSelectedDialog] = useState<"Input" | "Setup">(
		"Input"
	); // New state

	useEffect(() => {
		fetchDomains();
	}, []);

	const fetchDomains = async () => {
		try {
			const response = await trackingDomainApi.getAll();
			setDomains(response.data);
			setError("");
		} catch (err) {
			setError("Failed to load tracking domains");
			console.error("Error fetching tracking domains:", err);
		}
	};

	const handleCreateSubdomain = async () => {
		if (!formData.trDomain) {
			setError("All domain fields are required");
			return;
		}

		try {
			setIsLoading(true);
			await trackingDomainApi.addNew({
				id: "",
				domain: mainDomain,
				tr_domain: formData.trDomain,
				portal_domain: "-----",
			});

			// console.log(`Tracking domain updated successfully: ${response.data}`);
			setSetUpResult(
				`Tracking domain "${formData.trDomain}" updated successfully!`
			);
			setSetUpResultList([]);
		} catch (err) {
			console.error("Error updating tracking domain:", err);
			setError("Failed to update tracking domain");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteDomain = async (id: number) => {
		try {
			await trackingDomainApi.delete(id);
			setDomains(domains.filter((domain) => domain.id !== id));
			setError("");
		} catch (err) {
			setError("Failed to delete tracking domain");
			console.error("Error deleting tracking domain:", err);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleCreateDialogClose = async () => {
		setIsCreateDialogOpen(false);
	};

	const handleDialogClose = async () => {
		setIsDialogOpen(false);
	};

	const handleAddDomain = async () => {
		if (!formData.domain) {
			setError("All domain fields are required");
			return;
		}

		setIsLoading(true);
		try {
			const response = await trackingDomainApi.add({
				domain: formData.domain,
				tr_domain: formData.trDomain,
				portal_domain: formData.portalDomain,
			});
			setDomains([...domains, response.data.data]);
			setFormData({
				domain: "",
				trDomain: "",
				portalDomain: "",
			});
			setError("");
			setIsDialogOpen(false);
		} catch (err: any) {
			setError("Failed to create subdomain");
			console.error("Error creating subdomain:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const setupTrackingDomain = async () => {
		setIsLoading(true);
		try {
			const response = await trackingDomainApi.createNew({
				domain: mainDomain,
				tr_domain: formData.trDomain,
				portal_domain: "-----",
			});
			const newDomain = response.data.data;

			// Update the trackingDomainList immediately
			setTrackingDomainList((prevList) => [...prevList, newDomain]);
			setSetUpResultList(newDomain);
			setSetUpResult("Tracking domain added successfully!");
			setFormData({ ...formData, trDomain: "" }); // Clear the input field
			setError("");

			await getTrackingDomain();
		} catch (err: any) {
			setError("Failed to create subdomain");
			console.error("Error creating subdomain:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveTrackingDomain = async (item: any) => {
		try {
			await trackingDomainApi.deleteDomain({
				domain: mainDomain,
				tr_domain: item.Name,
				portal_domain: "-----",
				id: item.Id,
			});

			// Update the trackingDomainList immediately
			setTrackingDomainList((prevList) =>
				prevList.filter((domain: any) => domain.Name !== item.Name)
			);

			setSetUpResult("Tracking domain deleted successfully!");
			setSetUpResultList([]);
		} catch (err) {
			console.error("Error deleting domain:", err);
			setError("Failed to delete tracking domain");
		}
	};

	const getTrackingDomain = async () => {
		setIsFetchingTrackingDomains(true); // Start loading
		try {
			const result = await trackingDomainApi.getTrackingDomains();
			// console.log(result.data.data);
			setTrackingDomainList(result.data.data);
		} catch (err) {
			console.error("Error fetching tracking domains:", err);
		} finally {
			setIsFetchingTrackingDomains(false); // Stop loading
		}
	};

	return (
		<div className="space-y-6">
			{error && (
				<div className="text-red-600 bg-red-50 p-2 rounded mb-1">
					{error}
				</div>
			)}
			<div>
				<Title>Tracking Domain</Title>
				<Text>View and manage tracking domain</Text>
			</div>
			<Card>
				<div className="flex justify-end px-6 pb-6">
					<Button onClick={() => setIsDialogOpen(true)}>
						Add Domain
					</Button>
				</div>
				<Table>
					<TableHead>
						<TableRow>
							<TableHeaderCell className="w-1/4">
								Domain
							</TableHeaderCell>
							<TableHeaderCell className="w-1/4">
								Status
							</TableHeaderCell>
							<TableHeaderCell className="w-1/4">
								Created At
							</TableHeaderCell>
							<TableHeaderCell className="w-1/4">
								Actions
							</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{domains.map((domain) => (
							<TableRow key={domain.id}>
								<TableCell className="w-1/4 align-top text-black">
									<div className="space-y-1">
										<div>{domain.domain}</div>
										<div className="text-sm text-gray-500">
											TR: {domain.tr_domain}
										</div>
									</div>
								</TableCell>
								<TableCell className="w-1/4 align-top text-black">
									<Badge color="green">Active</Badge>
								</TableCell>
								<TableCell className="w-1/4 align-top text-black">
									{formatDate(domain.created_at)}
								</TableCell>
								<TableCell className="w-1/4 align-top text-black">
									<Button
										className="mr-2"
										size="xs"
										variant="secondary"
										onClick={async () => {
											setIsCreateDialogOpen(true);
											setSelectedDialog("Input");
											// setTrStatus(domain.tr_domain === "-----" ? false : true);
											setMainDomain(domain.domain);

											await getTrackingDomain();
										}}
									>
										Set Up Tracking Domain
									</Button>
									<Button
										size="xs"
										variant="secondary"
										color="red"
										onClick={() =>
											handleDeleteDomain(domain.id)
										}
									>
										Delete
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			{isDialogOpen && (
				<Dialog
					open={isDialogOpen}
					onClose={handleDialogClose}
					static={true}
				>
					<DialogPanel>
						<div>
							<h3 className="text-lg font-medium leading-6 text-gray-900 mb-10 py-2 border-b border-gray-200">
								Add Domain
							</h3>

							<div className="mb-3">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Main Domain (Required)
								</label>
								<TextInput
									placeholder="Domain (e.g., example.com)"
									value={formData.domain}
									onChange={(e) =>
										setFormData({
											...formData,
											domain: e.target.value,
										})
									}
								/>
							</div>

							<div className="flex justify-end gap-2 mt-12">
								<Button
									variant="secondary"
									onClick={handleDialogClose}
								>
									Cancel
								</Button>
								<Button
									variant="primary"
									onClick={handleAddDomain}
									disabled={!formData.domain || isLoading}
									loading={isLoading}
								>
									Add Domain
								</Button>
							</div>
						</div>
					</DialogPanel>
				</Dialog>
			)}

			{/* Conditionally Render Dialogs */}
			{isCreateDialogOpen && (
				<Dialog
					open={isCreateDialogOpen}
					onClose={handleCreateDialogClose}
					static={true}
				>
					<DialogPanel className="w-full max-w-xl">
						<div>
							<div className="text-lg font-medium leading-6 text-gray-900 mb-5 py-2 border-b border-gray-200">
								Set Up Tracking Domain {"("} Main Domain :{" "}
								{mainDomain} {")"}
							</div>
							{/* Radio Buttons to Toggle Dialogs */}
							<div className="flex items-center gap-6 mb-2">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="dialogType"
										value="Input"
										checked={selectedDialog === "Input"}
										onChange={() =>
											setSelectedDialog("Input")
										}
									/>
									Input Existing Domain
								</label>
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="dialogType"
										value="Setup"
										checked={selectedDialog === "Setup"}
										onChange={() =>
											setSelectedDialog("Setup")
										}
									/>
									Setup with our NS Delegation
								</label>
							</div>

							{/* Render Input Dialog */}
							{selectedDialog === "Input" && (
								<div>
									{isFetchingTrackingDomains ? (
										<div className="flex justify-center items-center py-10">
											<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
										</div>
									) : (
										<>
											<div>
												<div className="pt-7 pb-1">
													<label>
														Tracking Domain
													</label>
												</div>
												<TextInput
													placeholder="Tracking Domain (e.g., tr.example.com)"
													value={formData.trDomain}
													onChange={(e) =>
														setFormData({
															...formData,
															trDomain:
																e.target.value,
														})
													}
												/>
											</div>

											<div className="flex justify-end gap-2 mt-12">
												<Button
													variant="secondary"
													onClick={
														handleCreateDialogClose
													}
												>
													Cancel
												</Button>
												<Button
													variant="primary"
													onClick={
														handleCreateSubdomain
													}
													disabled={
														!formData.trDomain ||
														isLoading
													}
												>
													Set Up Tracking Domain
												</Button>
											</div>
										</>
									)}
								</div>
							)}

							{/* Render Setup Dialog */}
							{selectedDialog === "Setup" && (
								<div>
									{/* <h3 className="text-lg font-medium leading-6 text-gray-900 mb-5 py-2 border-b border-gray-200">
										Add Domain {"("} Main Domain : {mainDomain} {")"}
									</h3> */}

									{isFetchingTrackingDomains ? (
										<div className="flex justify-center items-center py-10">
											<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
										</div>
									) : (
										<>
											<div className="border border-radius-10 p-5 mt-5">
												<div className="py-2">
													<label>
														Here is a list of
														subdomains for{" "}
														{mainDomain} in our DNS
														provider.{" "}
													</label>
												</div>
												<div>
													{trackingDomainList.map(
														(item: any) => (
															<li
																key={item.id}
																className="flex items-center justify-between px-2"
															>
																<span>
																	▫{" "}
																	{item.Name}
																</span>
																<button
																	aria-label="Remove"
																	className="text-red-600 hover:text-red-800 ml-2"
																	onClick={() =>
																		handleRemoveTrackingDomain(
																			item
																		)
																	}
																>
																	<Trash2 className="w-4 h-4" />
																</button>
															</li>
														)
													)}
												</div>
											</div>
											<div className="flex items-center gap-2 pt-4">
												<TextInput
													placeholder="Add Tracking Domain (e.g., tr.example.com)"
													value={formData.trDomain}
													onChange={(e) =>
														setFormData({
															...formData,
															trDomain:
																e.target.value,
														})
													}
												/>
												<Button
													className="w-13 h-8"
													onClick={() =>
														setupTrackingDomain()
													}
													disabled={
														!formData.trDomain ||
														isLoading
													}
													loading={isLoading}
												>
													+ Add
												</Button>
											</div>
										</>
									)}

									{setupResult && (
										<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
											<p className="text-green-600">
												{setupResult}
											</p>
											{setupResultList.length == 0
												? null
												: setupResultList.map(
														(item: any) => (
															<li>{item}</li>
														)
												  )}
										</div>
									)}

									<div className="flex justify-end gap-2 mt-5">
										<Button
											variant="secondary"
											onClick={handleCreateDialogClose}
										>
											Cancel
										</Button>
										<Button
											variant="primary"
											onClick={handleCreateSubdomain}
											disabled={
												!formData.trDomain || isLoading
											}
										>
											Set Up Tracking Domain
										</Button>
									</div>
								</div>
							)}
						</div>
					</DialogPanel>
				</Dialog>
			)}
		</div>
	);
});

export default TrackingDomainsCopy;
