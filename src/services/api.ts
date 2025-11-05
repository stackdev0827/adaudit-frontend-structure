import axiosInstance from "./axios";
import { LoginCredentials, RegisterCredentials } from "../types/auth";

import {
	AUTH_API,
	METRICS_API,
	INTEGRATION_API,
	TRACKING_DOMAIN_API,
	URL_RULE_API,
	Event_API,
	METRICS_TABLE_API,
	PRODUCTS_API,
	NORMALIZED_API,
	PROFILE_API,
	BUSINESS_API,
} from "../constants/api";

interface AddDomainPayload {
	domain: string;
	tr_domain: string;
	portal_domain: string;
}

interface AddTrackingDomainToDBPayload {
	id: string;
	domain: string;
	tr_domain: string;
	portal_domain: string;
}

interface EditRulePayload {
	// Define the properties of EditRulePayload here, for example:
	// name: string;
	// url: string;
}

export { creativeBoardApi } from "./creativeBoardApi";

// Auth APIs
export const authApi = {
	login: async (credentials: LoginCredentials, state: string) => {
		console.log("login", credentials, state);
		if (state) {
			return axiosInstance.post(AUTH_API.LOGIN, credentials, {
				params: { state },
			});
		}
		return axiosInstance.post(AUTH_API.LOGIN, credentials);
	},
	register: async (credentials: RegisterCredentials) => {
		// Convert camelCase to snake_case for API
		const apiData = {
			name: credentials.name,
			email: credentials.email,
			password: credentials.password,
			company: credentials.company,
			job_title: credentials.jobTitle,
			phone_number: credentials.phoneNumber,
		};
		return axiosInstance.post(AUTH_API.REGISTER, apiData);
	},
	logout: async () => {
		return axiosInstance.post(AUTH_API.LOGOUT);
	},
};

export const businessApi = {
	getAll: async () => {
		return axiosInstance.get(BUSINESS_API.ALL);
	},
	changeBusinessAccount: async (id: string) => {
		return axiosInstance.post(BUSINESS_API.SELECT, {
			business_id: Number(id),
		});
	},
	create: async (data: any) => {
		return axiosInstance.post(BUSINESS_API.CREATE, data);
	},
	delete: async (id: number) => {
		return axiosInstance.delete(BUSINESS_API.CREATE, {
			data: { business_id: id },
		});
	},
};

export const metricsApi = {
	all: async (timeFrames: any) => {
		return axiosInstance.post(METRICS_API.ALL, timeFrames);
	},
	test: async (payload: any) => {
		return axiosInstance.post(METRICS_API.TEST, payload);
	},
	getAdsets: async (campaignId: string, payload: any) => {
		return axiosInstance.post(
			`${METRICS_API.ADSETS}?campaign_id=${campaignId}`,
			payload
		);
	},
	getAds: async (adsetId: string, campaignId: string, payload: any) => {
		return axiosInstance.post(
			`${METRICS_API.ADS}?campaign_id=${campaignId}&adset_id=${adsetId}`,
			{ payload }
		);
	},
	createReport: async (data: any) => {
		return axiosInstance.post(METRICS_API.REPORT, {
			report_name: data.reportName,
			date: data.date,
			tables: { report_name: data.reportName },
		});
	},
	deleteReport: async (data: any) => {
		return axiosInstance.post(METRICS_API.DELETE, {
			date: data.date,
			report_name: data.report_name,
		});
	},
	saveNote: async (data: any) => {
		return axiosInstance.post(METRICS_API.NOTEBOOK, {
			date: data.report_date,
			report_name: data.report_name,
			notes: data.notebook,
		});
	},
	getNotebook: async (data: any) => {
		return axiosInstance.post(METRICS_API.GETNOTBOOK, {
			date: data.date,
			report_name: data.report_name,
		});
	},
	duplicate: async (data: any) => {
		return axiosInstance.post(METRICS_API.DUPLICATE, data);
	},
	duplicateSave: async (data: any) => {
		return axiosInstance.post(METRICS_API.SAVEDUPLICATE, data);
	},
};

// Integration APIs
export const integrationApi = {
	getAll: async () => {
		return axiosInstance.get(INTEGRATION_API.BASE);
	},
	// OnceHub specific endpoints
	connectOnceHub: async (accountName: string, apiToken: string) => {
		return axiosInstance.post(INTEGRATION_API.ONCEHUB.CONNECT, {
			account_name: accountName,
			api_token: apiToken,
		});
	},
	disconnectOnceHub: async (accountName: string) => {
		return axiosInstance.post(INTEGRATION_API.ONCEHUB.DISCONNECT, {
			account_name: accountName,
		});
	},
	getMasterPages: async (
		page: number = 1,
		page_size: number = 10,
		account_id?: string,
		search?: string | "",
		sortConfig?: {
			key: string;
			direction: "asc" | "desc";
		}
	) => {
		return axiosInstance.get(INTEGRATION_API.ONCEHUB.MASTER_PAGES, {
			params: {
				page,
				page_size,
				account_name: account_id,
				search,
				sortConfig,
			},
		});
	},
	updateDateOnceHub: async (date: any) => {
		return axiosInstance.post(INTEGRATION_API.ONCEHUB.DATE, {
			date: date,
		});
	},
	syncOnceHubPages: (account_id: string) => {
		return axiosInstance.post(INTEGRATION_API.ONCEHUB.SYNC, {
			account_name: account_id,
		});
	},
	syncOnceHubData: async (data: any) => {
		return axiosInstance.post(INTEGRATION_API.ONCEHUB.SYNC_DATA, data);
	},
	// Typeform specific endpoints
	getTypeformAuthUrl: async () => {
		return axiosInstance.get(INTEGRATION_API.TYPEFORM.AUTH, {
			params: { account_name: "test" },
		});
	},
	fetchTypeformEndings: (form_id: string, account_name: string) => {
		return axiosInstance.get(INTEGRATION_API.TYPEFORM.ENDINGS, {
			params: {
				form_id: form_id,
				account_name: account_name,
			},
		});
	},
	setQualificationRuleOnEnding: (data: any) => {
		return axiosInstance.post(
			INTEGRATION_API.TYPEFORM.QUALIFIEDENDING,
			data
		);
	},
	disconnectTypeformForms: async (accountName: string) => {
		return axiosInstance.post(INTEGRATION_API.TYPEFORM.DISCONNECT, {
			account_name: accountName,
		});
	},
	// Get Typeform forms
	getTypeformForms: (
		page: number = 1,
		page_size: number = 10,
		account_id: string,
		search?: string | "",
		sortConfig?: {
			key: string;
			direction: "asc" | "desc";
		}
	) => {
		return axiosInstance.get(INTEGRATION_API.TYPEFORM.FORMS, {
			params: {
				page,
				page_size,
				account_name: account_id,
				search,
				sortConfig,
			},
		});
	},
	getEventTypes: (
		page: number = 1,
		page_size: number = 10,
		account_id?: string | null,
		search?: string | "",
		sortConfig?: {
			key: string;
			direction: "asc" | "desc";
		}
	) => {
		const params: any = {
			page,
			page_size,
			search,
			sortConfig,
		};

		if (account_id) {
			params.account_name = account_id;
		}

		return axiosInstance.get(INTEGRATION_API.CALENDLY.EVENTTYPES, {
			params,
		});
	},
	// Create webhook for form id
	createTypeformWebhook: (form_id: string, account_id: string) => {
		return axiosInstance.post(
			`${INTEGRATION_API.TYPEFORM.FORMS}/${form_id}/${account_id}/webhook`
		);
	},
	// delete webhook for form id
	deleteTypeformWebhook: (form_id: string, account_id: string) => {
		return axiosInstance.delete(
			`${INTEGRATION_API.TYPEFORM.FORMS}/${form_id}/${account_id}/webhook`
		);
	},
	// Add new sync method for Typeform
	syncTypeformForms: (accountName: string) => {
		return axiosInstance.post(INTEGRATION_API.TYPEFORM.SYNC, {
			account_name: accountName,
		});
	},
	syncTypeformData: async (date: any) => {
		return axiosInstance.post(INTEGRATION_API.TYPEFORM.SYNC_DATA, {
			date: date,
		});
	},
	updateDateTypeform: async (date: any) => {
		return axiosInstance.post(INTEGRATION_API.TYPEFORM.DATE, {
			date: date,
		});
	},
	// Bulk webhook operations
	createAllTypeformWebhooks: (formIds: string[]) => {
		return axiosInstance.post(INTEGRATION_API.TYPEFORM.WEBHOOKS, {
			form_ids: formIds,
		});
	},
	deleteAllTypeformWebhooks: (formIds: string[]) => {
		return axiosInstance.delete(INTEGRATION_API.TYPEFORM.WEBHOOKS, {
			data: { form_ids: formIds },
		});
	},
	// Hyros specific endpoints
	syncHyrosData: async (data: any) => {
		return axiosInstance.post(INTEGRATION_API.HYROS.SYNC_DATA, data);
	},
	updateApiHyros: async (
		email: string,
		password: string,
		apiToken: string,
		accountName: string
	) => {
		return axiosInstance.post(INTEGRATION_API.HYROS.CONNECT, {
			email,
			password,
			api_token: apiToken,
			account_name: accountName,
		});
	},
	getTags: async () => {
		return axiosInstance.get(INTEGRATION_API.HYROS.GETTAGS);
	},
	saveTagAssignments: async (data: any) => {
		return axiosInstance.post(INTEGRATION_API.HYROS.STORETAGS, {
			data,
		});
	},
	getHyrosAPIList: async () => {
		return axiosInstance.get(INTEGRATION_API.HYROS.APILISTS);
	},
	connectHyros: async (credentials: any) => {
		return axiosInstance.post(INTEGRATION_API.HYROS.CONNECT, {
			email: credentials.email,
			password: credentials.password,
		});
	},
	disconnectHyros: async () => {
		return axiosInstance.post(INTEGRATION_API.HYROS.DISCONNECT);
	},
	// Google Ads specific endpoints
	getGoogleAdsAuthUrl: async (accountName?: string) => {
		return axiosInstance.get(INTEGRATION_API.GOOGLE_ADS.AUTH, {
			params: accountName ? { account_name: accountName } : {},
		});
	},
	disconnectGoogleAds: async (accountName: string) => {
		return axiosInstance.post(INTEGRATION_API.GOOGLE_ADS.DISCONNECT, {
			account_name: accountName,
		});
	},
	// Meta Ads specific endpoints
	getMetaAdsAuthUrl: async (accountName?: string) => {
		return axiosInstance.get(INTEGRATION_API.META_ADS.AUTH, {
			params: accountName ? { account_name: accountName } : {},
		});
	},
	disconnectMetaAds: async (accountName: string) => {
		return axiosInstance.post(INTEGRATION_API.META_ADS.DISCONNECT, {
			account_name: accountName,
		});
	},
	getOncehubAuthUrl: async (
		integrationId: string,
		apiToken: string,
		accountName: string
	) => {
		return axiosInstance.post(INTEGRATION_API.ONCEHUB.AUTH, {
			integration_id: parseInt(integrationId),
			api_token: apiToken,
			account_name: accountName,
		});
	},
	updateOncehubMasterPages: async (data: any) => {
		return axiosInstance.post(
			INTEGRATION_API.ONCEHUB.WEBHOOK_MASTER_PAGES,
			{
				master_pages: data,
			}
		);
	},
	// Calendly specific endpoints
	getCalendlyAuthUrl: async (accountName?: string) => {
		return axiosInstance.get(INTEGRATION_API.CALENDLY.AUTH, {
			params: accountName ? { account_name: accountName } : {},
		});
	},
	disconnectCalendly: async (accountId: string) => {
		return axiosInstance.post(INTEGRATION_API.CALENDLY.DISCONNECT, {
			account_name: accountId,
		});
	},
	// Get accounts for any integration
	getAccounts: async (
		id: string,
		page: number = 1,
		page_size: number = 10
	) => {
		// id is integration_id in the backend
		return axiosInstance.get(INTEGRATION_API.ACCOUNTS, {
			params: {
				integration_id: parseInt(id),
				page,
				page_size,
			},
		});
	},
	// Add account for any integration
	addAccount: async (
		integrationId: string,
		apiToken: string,
		accountName?: string
	) => {
		const payload: any = {
			integration_id: parseInt(integrationId),
			api_token: apiToken,
		};

		if (accountName) {
			payload.account_name = accountName;
		}

		return axiosInstance.post(INTEGRATION_API.ADD_ACCOUNT, payload);
	},
	deleteAccount: async (
		integrationId: string | number,
		accountId: number
	) => {
		// backend expects integration_id and account_id in request body for DELETE
		return axiosInstance.post(INTEGRATION_API.DELETEACCOUNT, {
			integration_id: parseInt(String(integrationId)),
			account_id: accountId,
		});
	},
	syncEventTypes: async (accountId: string) => {
		return axiosInstance.post(INTEGRATION_API.CALENDLY.SYNC, {
			account_name: accountId,
		});
	},
	updateCalendlyEventTypes: async (data: any) => {
		return axiosInstance.post(INTEGRATION_API.CALENDLY.UPDATEEVENTTYPES, {
			eventTypes: data,
		});
	},
	getMetaAdsAccounts: (
		page: number = 1,
		page_size: number = 10,
		account_name: string
	) => {
		return axiosInstance.get(INTEGRATION_API.META_ADS.ADACCOUNTS, {
			params: {
				page,
				page_size,
				account_name,
			},
		});
	},
	getGoogleAdsAccounts: (
		page: number = 1,
		page_size: number = 10,
		account_name: string
	) => {
		return axiosInstance.get(INTEGRATION_API.GOOGLE_ADS.ADACCOUNTS, {
			params: {
				page,
				page_size,
				account_name,
			},
		});
	},
	syncMetaAdAccount: async (account_name: string) => {
		return axiosInstance.get(INTEGRATION_API.META_ADS.SYNC, {
			params: {
				account_name,
			},
		});
	},
	syncGoogleAdAccount: async (account_name: string) => {
		return axiosInstance.get(INTEGRATION_API.GOOGLE_ADS.SYNC, {
			params: {
				account_name,
			},
		});
	},
	updateMetaAdsCronStatus: async (id: number, status: number) => {
		return axiosInstance.post(INTEGRATION_API.META_ADS.UPDATESTATUS, {
			status: { id, status },
		});
	},
	updateGoogleAdsCronStatus: async (id: number, status: number) => {
		return axiosInstance.post(INTEGRATION_API.GOOGLE_ADS.UPDATESTATUS, {
			status: { id, status },
		});
	},
	updateTypeformSelection: async (data: any) => {
		return axiosInstance.post(INTEGRATION_API.TYPEFORM.WEBHOOKS, {
			id: data.form_id,
			status: data.checked === false ? 0 : 1,
		});
	},
	updateOncehubSelection: async (data: any) => {
		return axiosInstance.post(INTEGRATION_API.ONCEHUB.TOGGLE, {
			id: data.form_id,
			status: data.checked === false ? 0 : 1,
		});
	},
	updateCalendlySelection: async (data: any) => {
		return axiosInstance.post(INTEGRATION_API.CALENDLY.TOGGLE, {
			id: data.form_id,
			status: data.checked === false ? 0 : 1,
		});
	},
	setRule: async (data: any) => {
		return axiosInstance.post(INTEGRATION_API.TYPEFORM.SETRULE, { data });
	},
};

// Tracking Domain APIs
export const trackingDomainApi = {
	createDomain: async (payload: any) => {
		return axiosInstance.post(TRACKING_DOMAIN_API.CREATE, payload);
	},
	getAll: async () => {
		return axiosInstance.get(TRACKING_DOMAIN_API.BASE);
	},
	generatedSubdomain: async () => {
		return axiosInstance.get(TRACKING_DOMAIN_API.GENRATE);
	},
	add: async (payload: AddDomainPayload) => {
		return axiosInstance.post(TRACKING_DOMAIN_API.BASE, payload);
	},
	edit: async (id: number, payload: AddDomainPayload) => {
		return axiosInstance.put(`${TRACKING_DOMAIN_API.BASE}/${id}`, payload);
	},
	delete: async (id: number) => {
		return axiosInstance.delete(`${TRACKING_DOMAIN_API.CREATE}/${id}`);
	},
	createNew: async (payload: AddDomainPayload) => {
		return axiosInstance.post(
			`${TRACKING_DOMAIN_API.BASE}/create-domain-in-dns`,
			payload
		);
	},
	deleteDomain: async (payload: AddTrackingDomainToDBPayload) => {
		return axiosInstance.post(
			`${TRACKING_DOMAIN_API.BASE}/delete-domain-in-dns`,
			payload
		);
	},
	getTrackingDomains: async () => {
		return axiosInstance.get(
			`${TRACKING_DOMAIN_API.BASE}/get-tracking-domain-route53`
		);
	},
	addNew: async (payload: AddTrackingDomainToDBPayload) => {
		return axiosInstance.post(
			`${TRACKING_DOMAIN_API.BASE}/add-domain`,
			payload
		);
	},
	getStatus: async (domainIds: string) => {
		return axiosInstance.get(TRACKING_DOMAIN_API.STATUS, {
			params: { tracking_domain_ids: domainIds },
		});
	},
	verifyDNS: async (domainId: string) => {
		return axiosInstance.post(
			`${TRACKING_DOMAIN_API.VERIFYDNS}/${domainId}`
		);
	},
	checkSSL: async (domainId: string) => {
		return axiosInstance.post(
			`${TRACKING_DOMAIN_API.CHECKSSL}/${domainId}`
		);
	},
};

export const urlRuleApi = {
	getAll: async () => {
		return axiosInstance.get(URL_RULE_API.BASE);
	},
	add: async (data: any) => {
		return axiosInstance.post(URL_RULE_API.BASE, data);
	},
	edit: async (id: number, payload: EditRulePayload) => {
		console.log(id, payload);
		return axiosInstance.put(`${URL_RULE_API.BASE}/${id}`, payload);
	},
	delete: async (id: number) => {
		return axiosInstance.delete(`${URL_RULE_API.BASE}/${id}`);
	},
	getLeadFormUrlRule: async () => {
		return axiosInstance.get(URL_RULE_API.LEADFORM);
	},
};

export const eventApi = {
	getAllUsers: async (page: number, pageSize: number, search: string) => {
		return axiosInstance.get(Event_API.USERS, {
			params: { page, pageSize, search },
		});
	},
	getAllApplications: async (
		page: number,
		pageSize: number,
		search: string
	) => {
		return axiosInstance.get(Event_API.APPLICATIONS, {
			params: { page, page_size: pageSize, search },
		});
	},
	getAllBookedCalls: async (
		page: number,
		pageSize: number,
		search: string
	) => {
		return axiosInstance.get(Event_API.BOOKED_CALLS, {
			params: { page, page_size: pageSize, search },
		});
	},
	getAllSales: async (page: number, pageSize: number, search: string) => {
		return axiosInstance.get(Event_API.SALES, {
			params: { page, page_size: pageSize, search },
		});
	},
	getAllSets: async (page: number, pageSize: number, search: string) => {
		return axiosInstance.get(Event_API.SETS, {
			params: { page, page_size: pageSize, search },
		});
	},
	getAllOffersMade: async (
		page: number,
		pageSize: number,
		search: string
	) => {
		return axiosInstance.get(Event_API.OFFERS_MADE, {
			params: { page, page_size: pageSize, search },
		});
	},
	getAllLeadFormSubmissions: async (
		page: number,
		pageSize: number,
		search: string
	) => {
		return axiosInstance.get(Event_API.LEAD_FORM_SUBMISSIONS, {
			params: { page, page_size: pageSize, search },
		});
	},

	getApplicationAnswer: async (applicationId: string) => {
		return axiosInstance.post(Event_API.APPLICATIONS_ANSWERS, {
			application_id: applicationId,
		});
	},
	addUsers: async (data: any) => {
		return axiosInstance.post(Event_API.USER, data);
	},
	addApplication: async (data: any) => {
		return axiosInstance.post(Event_API.APPLICATION, data);
	},
	addBookedCall: async (data: any) => {
		return axiosInstance.post(Event_API.BOOKED_CALL, data);
	},
	addOptIn: async (data: any) => {
		return axiosInstance.post(Event_API.LEAD_FORM_SUBMISSION, data);
	},
	addSet: async (data: any) => {
		return axiosInstance.post(Event_API.SET, data);
	},
	addSale: async (data: any) => {
		return axiosInstance.post(Event_API.SALE, data);
	},
	addOfferMade: async (data: any) => {
		return axiosInstance.post(Event_API.OFFER, data);
	},
	// getUserJourney: async (data: any) => {
	//   return axiosInstance.post(Event_API.USERJOURNEY, data);
	// },
	getUserJourney: async (data: any) => {
		return axiosInstance.get(Event_API.USERJOURNEY, {
			params: { userId: data.userId },
		});
	},
	getUserInfo: async (data: any) => {
		return axiosInstance.get(Event_API.USERINFO, {
			params: { userId: data.userId },
		});
	},
	updateEventField: async (
		selectedOption: string,
		rowId: string,
		col: string,
		editingValue: any
	) => {
		const value =
			col === "grade"
				? parseInt(editingValue)
				: col === "biggest_impact"
				? parseInt(editingValue)
				: editingValue;
		return axiosInstance.put(Event_API.UPDATEEVENTFIELD, {
			event_type: selectedOption,
			event_id: rowId,
			field: col,
			value: value,
		});
	},
	updateUserInfo: async (
		userId: string,
		key: string,
		value: string,
		option: string
	) => {
		return axiosInstance.post(Event_API.UPDATEUSERINFO, {
			tab: option,
			id: userId,
			field: key,
			value: value,
		});
	},
	getBiggestImpactOptions: async (selectedOption: string, rowId: string) => {
		return axiosInstance.get(Event_API.BIGGEST_IMPACT_OPTIONS, {
			params: { event_type: selectedOption, event_id: rowId },
		});
	},
};

// Add metrics table API endpoints
export const metricsTableApi = {
	getCampaignNames: async () => {
		return axiosInstance.get(METRICS_API.CAMPAIGNNAME);
	},
	getAdAccountID: async (searchValueAdAccount?: string) => {
		return axiosInstance.get(METRICS_API.ADACCOUNTID, {
			params: { search: searchValueAdAccount || "" },
		});
	},
	getAdPlatforms: async () => {
		return axiosInstance.get(METRICS_API.ADPLATFORMS);
	},
	// Save a metrics table to the database
	saveTable: async (tableData: any) => {
		return axiosInstance.post(METRICS_TABLE_API.SAVE, tableData);
	},

	// Get all metrics tables for the current user
	getAllTables: async (page = 1, pageSize = 10, search = "") => {
		return axiosInstance.get(METRICS_TABLE_API.ALL, {
			params: { page, page_size: pageSize, search },
		});
	},
	saveTemplate: async (
		payload: any,
		reportName: string,
		reportDate: string,
		tableName: string,
		parentGroups: any
	) => {
		return axiosInstance.post(METRICS_API.TEMPLATE, {
			notes: payload,
			report_name: reportName,
			report_date: reportDate,
			table_name: tableName,
			filter: parentGroups,
		});
	},
	getTableByDate: async (date: string, report_name: string) => {
		return axiosInstance.post(METRICS_TABLE_API.DATE, {
			date,
			report_name,
		});
	},

	// Delete a metrics table
	deleteTable: async (tableId: string) => {
		return axiosInstance.delete(`${METRICS_TABLE_API.DELETE}/${tableId}`);
	},

	// Update a metrics table
	updateTable: async (tableId: string, tableData: any) => {
		return axiosInstance.put(
			`${METRICS_TABLE_API.UPDATE}/${tableId}`,
			tableData
		);
	},

	getTodayGrade: async (campaignId: string) => {
		return axiosInstance.get(
			`${METRICS_TABLE_API.TODAYGRADE}/${campaignId}`
		);
	},

	getGrade: async (campaignId: string) => {
		return axiosInstance.get(`${METRICS_TABLE_API.GARDE}/${campaignId}`);
	},

	saveGrade: async (
		campaignId: string,
		date: string,
		grade: string,
		comment: string,
		platform: string
	) => {
		return axiosInstance.post(METRICS_TABLE_API.GARDE, {
			campaign_id: campaignId,
			date: date,
			grade: grade || "1",
			comment: comment,
			platform: platform,
		});
	},
};

export const validationCheck = {
	status: async () => {
		return axiosInstance.get(INTEGRATION_API.BASE);
	},
};

export const productsApi = {
	getAll: async () => {
		return axiosInstance.get(PRODUCTS_API.ALL);
	},
};

// Normalized Endpoints
export const normalizedApi = {
	getAll: async (payload: any) => {
		return axiosInstance.post(NORMALIZED_API.ALL, payload);
	},
	saveTemplate: async (payload: any) => {
		return axiosInstance.post(NORMALIZED_API.TEMPLATE, payload);
	},
	template: async () => {
		return axiosInstance.get(NORMALIZED_API.TEMPLATE);
	},
	getReports: async (page: number, page_size: number) => {
		return axiosInstance.get(NORMALIZED_API.REPORTS, {
			params: { page, page_size },
		});
	},
	deleteReport: async (reportId: number) => {
		return axiosInstance.delete(`${NORMALIZED_API.REPORTS}/${reportId}`);
	},
	getReport: async (reportId: number) => {
		return axiosInstance.get(`${NORMALIZED_API.REPORTS}/${reportId}`);
	},
	deleteTemplate: async (templateId: string) => {
		return axiosInstance.delete(`${NORMALIZED_API.TEMPLATE}/${templateId}`);
	},
};

export const profileApi = {
	getUserInfo: async () => {
		return axiosInstance.get(PROFILE_API.USERINFO);
	},
	updateUserInfo: async (data: any) => {
		return axiosInstance.post(PROFILE_API.USERINFO, data);
	},
	changePassword: async (data: any) => {
		return axiosInstance.post(PROFILE_API.CHANGEPASSWORD, data);
	},
};
