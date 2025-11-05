import React, { useState } from "react";
import { TextInput, Button, Card, Title, Text } from "@tremor/react";
import {
	Link,
	useNavigate,
	useLocation,
	useSearchParams,
} from "react-router-dom";
import { LoginCredentials } from "../types/auth";
import { authApi } from "../services/api";
import { setToken } from "../utils/token";
import { config } from "../config/env";

const Login: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const [credentials, setCredentials] = useState<LoginCredentials>({
		email: "",
		password: "",
	});
	const [error, setError] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const state = searchParams.get("state") || "";
			const response = await authApi.login(credentials, state);
			if (response.data?.access_token) {
				setToken(response.data.access_token);
				localStorage.setItem("metricsTables", JSON.stringify([]));

				// If there's a return_to URL, use it, otherwise fallback to default navigation
				const returnTo = searchParams.get("return_to");
				if (returnTo) {
					// Check if returnTo is an API endpoint (starts with /api)
					const isApiEndpoint = returnTo.startsWith("/api");

					// Use SERVER_ADDRESS for API endpoints, window.location.origin for frontend routes
					const baseUrl = isApiEndpoint
						? config.SERVER_ADDRESS
						: window.location.origin;
					const returnToUrl = new URL(returnTo, baseUrl);

					if (state) {
						returnToUrl.searchParams.set("state", state);
					}
					returnToUrl.searchParams.set(
						"token",
						response.data.access_token
					);
					window.location.href = returnToUrl.toString();
				} else {
					const path = location.state?.from?.pathname || "/dashboard";
					navigate(path);
				}
			}
		} catch (err) {
			setError("Invalid email or password. Please try again.");
			console.error("Login error:", err);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="max-w-md w-full">
				<div className="text-center mb-8">
					<Title>Welcome Back</Title>
					<Text>Sign in to your account</Text>
				</div>
				{error && (
					<div className="mb-4 p-2 text-red-600 bg-red-50 rounded text-center">
						{error}
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<TextInput
							placeholder="Email"
							type="email"
							value={credentials.email}
							onChange={(e) =>
								setCredentials({
									...credentials,
									email: e.target.value,
								})
							}
							required
						/>
					</div>
					<div>
						<TextInput
							placeholder="Password"
							type="password"
							value={credentials.password}
							onChange={(e) =>
								setCredentials({
									...credentials,
									password: e.target.value,
								})
							}
							required
						/>
					</div>
					<Button type="submit" className="w-full">
						Sign In
					</Button>
				</form>
				<div className="mt-4 text-center">
					<Text>
						Don't have an account?{" "}
						<Link
							to="/register"
							className="text-blue-600 hover:text-blue-800"
						>
							Register
						</Link>
					</Text>
				</div>
			</Card>
		</div>
	);
};

export default Login;
