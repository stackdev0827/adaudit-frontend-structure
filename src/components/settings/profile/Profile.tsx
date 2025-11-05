import React, { useEffect, useState } from "react";
import { Card, Button } from "@tremor/react";
import { Input } from "../../../pages/reports/input";
import { profileApi } from "../../../services/api";
import PasswordChangeDialog from "./PasswordChangeDialog";

interface UserInfo {
	email: string;
	phone_number: string;
	timezone: string;
	date_format: string;
	first_name: string;
	last_name: string;
	country: string;
	region: string;
	city: string;
	address: string;
	zip_code: string;
	vat_number: string;
	company: string;
	id: number;
	job_title: string;
	sync_qualified: boolean;
}

const Profile: React.FC = React.memo(() => {
	const timezones = [
		"UTC",
		"Etc/GMT",
		"Europe/London",
		"Europe/Berlin",
		"Europe/Paris",
		"Europe/Madrid",
		"Europe/Rome",
		"Europe/Moscow",
		"Asia/Dubai",
		"Asia/Karachi",
		"Asia/Kolkata",
		"Asia/Dhaka",
		"Asia/Bangkok",
		"Asia/Jakarta",
		"Asia/Shanghai",
		"Asia/Hong_Kong",
		"Asia/Singapore",
		"Asia/Tokyo",
		"Asia/Kathmandu",
		"Asia/Yangon",
		"Australia/Sydney",
		"Australia/Melbourne",
		"Australia/Brisbane",
		"Australia/Perth",
		"Pacific/Auckland",
		"Pacific/Fiji",
		"Africa/Cairo",
		"Africa/Nairobi",
		"Africa/Lagos",
		"Africa/Johannesburg",
		"America/New_York",
		"America/Chicago",
		"America/Denver",
		"America/Los_Angeles",
		"America/Toronto",
		"America/Mexico_City",
		"America/Bogota",
		"America/Lima",
		"America/Santiago",
		"America/Caracas",
		"America/Sao_Paulo",
		"America/Argentina/Buenos_Aires",
		"America/Vancouver",
		"America/Phoenix",
		"America/Anchorage",
		"Pacific/Honolulu",
	];

	const countryRegions = {
		"United States": ["EST", "CST", "MST", "PST", "AKST", "HST"],
		"United Kingdom": ["GMT", "BST"],
		Germany: ["CET", "CEST"],
		France: ["CET", "CEST"],
		Spain: ["CET", "CEST"],
		Italy: ["CET", "CEST"],
		Poland: ["CET", "CEST"],
		Russia: [
			"MSK",
			"YEKT",
			"OMST",
			"KRAT",
			"IRKT",
			"YAKT",
			"VLAT",
			"MAGT",
			"SAKT",
			"PETT",
			"KAMT",
		],
		China: ["CST"],
		Japan: ["JST"],
		Australia: ["AWST", "ACST", "AEST"],
		Canada: ["NST", "AST", "EST", "CST", "MST", "PST"],
		India: ["IST"],
		Brazil: ["BRT", "BRST"],
		Mexico: ["CST", "MST", "PST"],
	};

	const [userInfo, setUserInfo] = useState<UserInfo>({
		email: "",
		phone_number: "",
		timezone: "UTC",
		date_format: "1",
		first_name: "",
		last_name: "",
		country: "",
		region: "",
		city: "",
		address: "",
		zip_code: "",
		vat_number: "",
		company: "",
		id: 0,
		job_title: "",
		sync_qualified: false,
	});
	const [selectedCountry, setSelectedCountry] =
		useState<string>("United States");
	const [isPasswordDialogOpen, setIsPasswordDialogOpen] =
		useState<boolean>(false);

	useEffect(() => {
		const getUserInfo = async () => {
			try {
				const response = await profileApi.getUserInfo();
				setUserInfo(response.data);
			} catch (error) {
				console.log(error);
			}
		};
		getUserInfo();
	}, []);

	const handleSave = async () => {
		console.log(userInfo);
		try {
			await profileApi.updateUserInfo(userInfo);
		} catch (error) {
			console.log(error);
		}
		localStorage.setItem("timezone", userInfo.timezone);
		localStorage.setItem("timeformat", userInfo.date_format);
	};

	const handlePasswordChangeSuccess = () => {
		// Show success message or handle success
		alert("Password changed successfully!");
	};

	return (
		<div>
			<div className="flex flex-col-2 gap-6 w-full">
				<div className="w-full space-y-5 ">
					<Card className="w-full space-y-4">
						<span className="text-lg font-semibold text-gray-800">
							Contact Information
						</span>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<div className="flex flex-col-2 gap-2">
								<Input defaultValue={userInfo.email} disabled />
								{/* <Button disabled>Change</Button> */}
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Phone number
							</label>
							<div className="flex flex-col-2 gap-2">
								<Input
									value={userInfo.phone_number}
									onChange={(e) =>
										setUserInfo((prev: any) => ({
											...prev,
											phone_number: e.target.value,
										}))
									}
								/>
								{/* <Button
									disabled={
										userInfo.client_phone ? true : false
									}
								>
									Add
								</Button> */}
							</div>
						</div>
					</Card>
					<Card className="w-full space-y-4">
						<span className="text-lg font-semibold text-gray-800">
							Basic Information
						</span>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Time zone
							</label>
							<select
								value={userInfo.timezone || ""}
								onChange={(e) =>
									setUserInfo((prev: any) => ({
										...prev,
										timezone: e.target.value,
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="" disabled>
									Select Option
								</option>
								{timezones.map((timezone) => (
									<option key={timezone} value={timezone}>
										{timezone}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Time format
							</label>
							<select
								value={userInfo.date_format || ""}
								onChange={(e) => {
									setUserInfo((prev: any) => ({
										...prev,
										date_format: e.target.value,
									}));
								}}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="" disabled>
									Select Option
								</option>
								<option key="1" value="1">
									ISO-8601 (YYYY-MM-DD)
								</option>
								<option key="2" value="2">
									US (MM/DD/YYYY)
								</option>
							</select>
						</div>
						<div>
							<div className="flex justify-between items-center gap-3">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Sync grade adjustments of bookings or apps
									with
								</label>
								<label
									className="inline-flex items-center cursor-pointer"
									title="Toggle sync status"
								>
									<input
										type="checkbox"
										className="sr-only"
										checked={userInfo.sync_qualified}
										onChange={() =>
											setUserInfo((prev: any) => ({
												...prev,
												sync_qualified:
													!prev.sync_qualified,
											}))
										}
									/>
									{/* visual switch */}
									<span
										className={`w-10 h-6 inline-block rounded-full transition-colors ${
											userInfo.sync_qualified
												? "bg-green-500"
												: "bg-gray-300"
										}`}
									>
										<span
											className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
												userInfo.sync_qualified
													? "translate-x-4"
													: "translate-x-0"
											} mt-1 ml-1`}
										/>
									</span>
								</label>
							</div>
						</div>
					</Card>
					<Card className="w-full space-y-4">
						<span className="text-lg font-semibold text-gray-800">
							Password
						</span>
						<div>
							<Button
								onClick={() => setIsPasswordDialogOpen(true)}
							>
								Change Password
							</Button>
						</div>
					</Card>
				</div>
				<div className="w-full space-y-5">
					<Card className="w-full space-y-4">
						<span className="text-lg font-semibold text-gray-800">
							Personal Information
						</span>
						<div>
							<div className="flex flex-col-2 gap-4 w-full mb-4">
								<div className="w-full">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										First Name
									</label>
									<Input
										value={userInfo.first_name}
										onChange={(e) =>
											setUserInfo((prev: any) => ({
												...prev,
												first_name: e.target.value,
											}))
										}
									/>
								</div>
								<div className="w-full">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Last Name
									</label>
									<Input
										value={userInfo.last_name}
										onChange={(e) =>
											setUserInfo((prev: any) => ({
												...prev,
												last_name: e.target.value,
											}))
										}
									/>
								</div>
							</div>
							<div className="flex flex-col-2 gap-4 w-full">
								<div className="w-full">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Company
									</label>
									<Input
										value={userInfo.company}
										onChange={(e) =>
											setUserInfo((prev: any) => ({
												...prev,
												company: e.target.value,
											}))
										}
									/>
								</div>
								<div className="w-full">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Job Title
									</label>
									<Input
										value={userInfo.job_title}
										onChange={(e) =>
											setUserInfo((prev: any) => ({
												...prev,
												job_title: e.target.value,
											}))
										}
									/>
								</div>
							</div>
						</div>
					</Card>

					<Card className="w-full space-y-4">
						<span className="text-lg font-semibold text-gray-800">
							Address
						</span>
						<div className="w-full">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Country
							</label>
							<select
								value={userInfo.country || ""}
								onChange={(e) => {
									setSelectedCountry(e.target.value);
									setUserInfo((prev: any) => ({
										...prev,
										country: e.target.value,
									}));
								}}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="" disabled>
									Select Option
								</option>
								{Object.keys(countryRegions).map((country) => (
									<option key={country} value={country}>
										{country}
									</option>
								))}
							</select>
						</div>
						<div className="flex justify-between gap-4 items-center">
							<div className="w-full">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Region
								</label>
								<select
									value={userInfo.region || ""}
									onChange={(e) =>
										setUserInfo((prev: any) => ({
											...prev,
											region: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="" disabled>
										Select Option
									</option>
									{countryRegions[
										selectedCountry as keyof typeof countryRegions
									]?.map((region: any) => (
										<option key={region} value={region}>
											{region}
										</option>
									))}
								</select>
							</div>
							<div className="w-full">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									City
								</label>
								<Input
									value={userInfo.city || ""}
									onChange={(e) =>
										setUserInfo((prev: any) => ({
											...prev,
											city: e.target.value,
										}))
									}
								/>
							</div>
						</div>
						<div className="w-full">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Address
							</label>
							<Input
								value={userInfo.address || ""}
								onChange={(e) =>
									setUserInfo((prev: any) => ({
										...prev,
										address: e.target.value,
									}))
								}
							/>
						</div>
						<div className="flex justify-between items-center gap-4">
							<div className="w-full">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Zip Code
								</label>
								<Input
									value={userInfo.zip_code || ""}
									onChange={(e) =>
										setUserInfo((prev: any) => ({
											...prev,
											zip_code: e.target.value,
										}))
									}
								/>
							</div>
							<div className="w-full">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									VAT number
								</label>
								<Input
									value={userInfo.vat_number || ""}
									onChange={(e) =>
										setUserInfo((prev: any) => ({
											...prev,
											vat_number: e.target.value,
										}))
									}
								/>
							</div>
						</div>
					</Card>
				</div>
			</div>
			<div className="flex justify-end">
				<Button onClick={() => handleSave()}>Save</Button>
			</div>
			<PasswordChangeDialog
				open={isPasswordDialogOpen}
				onClose={() => setIsPasswordDialogOpen(false)}
				onSuccess={handlePasswordChangeSuccess}
			/>
		</div>
	);
});

export default Profile;
