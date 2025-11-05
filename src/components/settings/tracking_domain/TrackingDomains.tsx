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

const TrackingDomains: React.FC = React.memo(() => {
	const [domains, setDomains] = useState<TrackingDomain[]>([]);
	const [formData, setFormData] = useState<DomainForm>({
		domain: "",
		trDomain: "",
		portalDomain: "",
	});
	const [error, setError] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [subdomainOption, setSubdomainOption] = useState<"input" | "create">(
		"create"
	);
	const [createResponse, setCreateResponse] = useState("");
	const [domainState, setDomainState] = useState(0); // 0: initial, 1: created, 2: saved
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		console.log("TrackingDomains useEffect");
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

	const handleAddDomain = async () => {
		if (!formData.domain || !formData.trDomain || !formData.portalDomain) {
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
			setDomains([...domains, response.data]);
			setFormData({
				domain: "",
				trDomain: "",
				portalDomain: "",
			});
			setDomainState(2); // Set state to 2 when domain is saved
			setError("");
			setIsDialogOpen(false);
		} catch (err: any) {
			setError("Failed to create subdomain");
			console.error("Error creating subdomain:", err);
			setCreateResponse(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateSubdomain = async () => {
		if (!formData.domain || !formData.trDomain || !formData.portalDomain) {
			setError("All domain fields are required");
			return;
		}

		setIsLoading(true);
		try {
			const response = await trackingDomainApi.createNew({
				domain: formData.domain,
				tr_domain: formData.trDomain,
				portal_domain: formData.portalDomain,
			});
			setDomains([...domains, response.data]);
			// console.log(response.data.data);
			setCreateResponse(response.data.data);
			setDomainState(1); // Set state to 1 when domain is created
			setError("");
		} catch (err: any) {
			setError("Failed to create subdomain");
			console.error("Error creating subdomain:", err);
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

	// const existingSubdomains = Array.from(
	// 	new Set(domains.map((d) => d.tr_domain.split(".")[0]))
	// );

	const handleDialogClose = async () => {
		if (domainState === 1) {
			// Just close if domain was saved
			setIsDialogOpen(false);
			setCreateResponse("");
			setDomainState(0);
		} else if (domainState === 0) {
			// Delete domain and close if domain was created but not saved
			try {
				await trackingDomainApi.deleteDomain({
					domain: formData.domain,
					tr_domain: formData.trDomain,
					portal_domain: formData.portalDomain,
				});
			} catch (err) {
				console.error("Error deleting domain:", err);
			}
			setIsDialogOpen(false);
			setCreateResponse("");
			setDomainState(0);
		} else {
			// Normal close for initial state
			setIsDialogOpen(false);
			setCreateResponse("");
			setDomainState(0);
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
							<TableHeaderCell>Domain</TableHeaderCell>
							<TableHeaderCell>Status</TableHeaderCell>
							<TableHeaderCell>Created At</TableHeaderCell>
							<TableHeaderCell>Actions</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{domains.map((domain) => (
							<TableRow key={domain.id}>
								<TableCell>
									<div className="space-y-1">
										<div>{domain.domain}</div>
										<div className="text-sm text-gray-500">
											TR: {domain.tr_domain}
										</div>
										<div className="text-sm text-gray-500">
											Portal: {domain.portal_domain}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge color="green">Active</Badge>
								</TableCell>
								<TableCell>
									{formatDate(domain.created_at)}
								</TableCell>
								<TableCell>
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

			<Dialog
				open={isDialogOpen}
				onClose={handleDialogClose}
				static={true}
			>
				<DialogPanel>
					<div className="space-y-10">
						<h3 className="text-lg font-medium leading-6 text-gray-900">
							Add Domain
						</h3>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
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
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Portal Domain
							</label>
							<TextInput
								placeholder="Portal Domain (e.g., portal.example.com)"
								value={formData.portalDomain}
								onChange={(e) =>
									setFormData({
										...formData,
										portalDomain: e.target.value,
									})
								}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-4">
								Tracking Domain
							</label>
							<div className="flex items-center gap-6 mb-3">
								<div className="flex items-center">
									<input
										type="radio"
										id="create-subdomain"
										name="subdomainOption"
										value="create"
										checked={subdomainOption === "create"}
										onChange={() =>
											setSubdomainOption("create")
										}
										className="mr-2"
									/>
									<label
										htmlFor="create-subdomain"
										className="text-sm"
									>
										Create new subdomain
									</label>
								</div>
								<div className="flex items-center">
									<input
										type="radio"
										id="input-subdomain"
										name="subdomainOption"
										value="input"
										checked={subdomainOption === "input"}
										onChange={() =>
											setSubdomainOption("input")
										}
										className="mr-2"
									/>
									<label
										htmlFor="input-subdomain"
										className="text-sm"
									>
										Input subdomain
									</label>
								</div>
							</div>
							<TextInput
								placeholder="Tracking Domain (e.g., tr.example.com)"
								value={formData.trDomain}
								onChange={(e) =>
									setFormData({
										...formData,
										trDomain: e.target.value,
									})
								}
							/>
						</div>

						<div className="flex justify-end gap-2 mt-4">
							<Button
								variant="secondary"
								onClick={handleDialogClose}
							>
								Cancel
							</Button>
							{subdomainOption === "input" ? (
								<Button
									variant="primary"
									onClick={handleAddDomain}
									disabled={
										!formData.domain ||
										!formData.trDomain ||
										isLoading
									}
									loading={isLoading}
								>
									Save Domain
								</Button>
							) : (
								<Button
									variant="primary"
									onClick={handleCreateSubdomain}
									disabled={
										!formData.domain ||
										!formData.trDomain ||
										isLoading
									}
									loading={isLoading}
								>
									Create Tracking Domain
								</Button>
							)}
						</div>

						{(createResponse || error) && (
							<div
								className={`p-4 rounded ${
									error
										? "text-red-600 bg-red-50"
										: "text-green-600 bg-green-50"
								}`}
							>
								<div className="font-medium mb-2">
									{error
										? "Error occurred!"
										: "Domain created successfully!"}
								</div>
								{error ? (
									<div className="text-sm">{error}</div>
								) : Array.isArray(createResponse) ? (
									<div className="space-y-2">
										{createResponse.map((item, index) => (
											<div
												key={index}
												className="text-sm"
											>
												<strong>
													NS Record {index + 1}:
												</strong>{" "}
												{item}
											</div>
										))}
									</div>
								) : (
									<div className="text-sm">
										{createResponse}
									</div>
								)}
							</div>
						)}
					</div>

					{subdomainOption === "create" ? (
						<div className="text-sm mt-6">
							<span>
								Please set the following NS records in your DNS
								Service Provider....
							</span>
						</div>
					) : null}
				</DialogPanel>
			</Dialog>
		</div>
	);
});

export default TrackingDomains;
