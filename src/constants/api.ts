// Auth API endpoints
export const AUTH_API = {
	LOGIN: "/admin/login",
	REGISTER: "/admin/register",
	LOGOUT: "/admin/logout",
} as const;

export const BUSINESS_API = {
	ALL: "/admin/businesses",
	SELECT: "/admin/business/select",
	CREATE: "/admin/business",
};

//Metrics API endpoints
export const METRICS_API = {
	ALL: "/admin/metrics/all",
	// TEST: '/admin/metrics/ad-audit/campaigns',
	TEST: "/admin/metrics/ad-audit",
	ADSETS: "/admin/metrics/ad-audit/adsets",
	ADS: "/admin/metrics/ad-audit/ads",
	GRADES: "/admin/metrics/ad-audit/grade",
	TEMPLATE: "/admin/metrics/ad-audit/template/save",
	REPORT: "/admin/metrics/ad-audit/report/create",
	DELETE: "/admin/metrics/ad-audit/report/delete",
	NOTEBOOK: "/admin/metrics/ad-audit/report/notebook",
	GETNOTBOOK: "/admin/metrics/ad-audit/report/getnotebook",
	DUPLICATE: "/admin/metrics/ad-audit/report/duplicate",
	SAVEDUPLICATE: "/admin/metrics/ad-audit/report/duplicate/save",
	CAMPAIGNNAME: "/admin/campaign-names",
	ADACCOUNTID: "/admin/ad-account-ids",
	ADPLATFORMS: "/admin/ad-platforms",
} as const;

// Normalized Report API endpoints
export const NORMALIZED_API = {
	ALL: "/admin/normalized-report/generate",
	TEMPLATE: "/admin/normalized-report/template",
	REPORTS: "/admin/normalized-report/reports",
};

export const PROFILE_API = {
	USERINFO: "/admin/profile",
	CHANGEPASSWORD: "/admin/client/password",
};

export const METRICS_TABLE_API = {
	SAVE: "/admin/metrics/ad-audit/report/save",
	ALL: "/admin/metrics/ad-audit/adaudit",
	DATE: "/admin/metrics/ad-audit/adaudit/date",
	DELETE: "/admin/metrics/ad-audit/adaudit/delete",
	UPDATE: "/admin/metrics/ad-audit/report/update",
	TODAYGRADE: "/admin/metrics/ad-audit/grade/today",
	GARDE: "/admin/metrics/ad-audit/grade",
} as const;

// Integration API endpoints
export const INTEGRATION_API = {
	BASE: "/admin/integrations",
	ONCEHUB: {
		CONNECT: "/admin/integrations/oncehub/connect",
		AUTH: "/admin/integrations/oncehub/connect",
		DISCONNECT: "/admin/integrations/oncehub/disconnect",
		MASTER_PAGES: "/admin/integrations/oncehub/master-pages",
		SYNC: "/admin/integrations/oncehub/sync",
		DATE: "admin/integrations/oncehub/date",
		SYNC_DATA: "/admin/integrations/oncehub/sync-data",
		WEBHOOK_MASTER_PAGES:
			"/admin/integrations/oncehub/webhook-master-pages",
		TOGGLE: "/admin/integrations/oncehub/master-page/status",
	},
	TYPEFORM: {
		AUTH: "/admin/integrations/typeform/auth",
		DISCONNECT: "/admin/integrations/typeform/disconnect",
		FORMS: "/admin/integrations/typeform/forms",
		SYNC: "/admin/integrations/typeform/sync",
		DATE: "admin/integrations/typeform/date",
		WEBHOOKS: "/admin/integrations/typeform/form/webhook",
		SYNC_DATA: "/admin/integrations/typeform/sync-data",
		ENDINGS: "/admin/integrations/typeform/form/endings",
		QUALIFIEDENDING:
			"/admin/integrations/typeform/form/qualification-rule-on-ending",
		SETRULE: "/admin/integrations/typeform/form/set-rule",
	},
	HYROS: {
		CONNECT: "/admin/integrations/hyros/connect",
		APITOKEN: "/admin/integrations/hyros/apitoken",
		DISCONNECT: "/admin/integrations/hyros/disconnect",
		GETTAGS: "/admin/integrations/hyros/tags",
		STORETAGS: "/admin/integrations/hyros/tags",
		APILISTS: "/admin/integrations/hyros/getapilists",
		DATE: "/admin/integrations/hyros/date",
		SYNC_DATA: "/admin/integrations/hyros/sync-data",
	},
	CALENDLY: {
		AUTH: "/admin/integrations/calendly/oauth/initiate",
		EVENTTYPES: "/admin/integrations/calendly/event-types",
		SYNC: "/admin/integrations/calendly/sync",
		DISCONNECT: "/admin/integrations/calendly/disconnect",
		UPDATEEVENTTYPES: "/api/v1/integrations/calendly/update-event-types",
		TOGGLE: "/admin/integrations/calendly/event-type/status",
	},
	GOOGLE_ADS: {
		AUTH: "/api/v1/integrations/google-ads/auth",
		ADACCOUNTS: "/api/v1/integrations/google-ads/accounts",
		UPDATESTATUS: "/api/v1/integrations/google-ads/status",
		SYNC: "/api/v1/integrations/google-ads/sync",
		DISCONNECT: "/api/v1/integrations/google-ads/disconnect",
	},
	META_ADS: {
		AUTH: "/api/v1/integrations/meta-ads/auth",
		ADACCOUNTS: "/api/v1/integrations/meta-ads/accounts",
		SYNC: "/api/v1/integrations/meta-ads/sync",
		UPDATESTATUS: "/api/v1/integrations/meta-ads/status",
		DISCONNECT: "/api/v1/integrations/meta-ads/disconnect",
	},
	ACCOUNTS: "/admin/integrations/accounts",
	DELETEACCOUNT: "/admin/integrations/accounts/delete",
	ADD_ACCOUNT: "/admin/integrations/accounts/add",
} as const;

// Tracking Domain API endpoints
export const TRACKING_DOMAIN_API = {
	BASE: "/admin/tracking-domain/list",
	CREATE: "/admin/tracking-domain",
	GENRATE: "/admin/tracking-domain/name",
	STATUS: "/admin/tracking-domain/status",
	VERIFYDNS: "/admin/tracking-domain/verify-dns",
	CHECKSSL: "/admin/tracking-domain/verify-ssl",
} as const;

//URL rule API endpoints
export const URL_RULE_API = {
	BASE: "/admin/url-rule",
	LEADFORM: "/admin/url-rule/leadform",
};

export const Event_API = {
	USERS: "/admin/event/users",
	USER: "/admin/event/user",
	APPLICATIONS: "/admin/event/applications",
	APPLICATION: "/admin/event/application",
	BOOKED_CALLS: "/admin/event/bookings",
	BOOKED_CALL: "/admin/event/booking",
	SALES: "/admin/event/sales",
	SALE: "/admin/event/sale",
	SETS: "/admin/event/sets",
	SET: "/admin/event/set",
	OFFERS_MADE: "/admin/event/offers",
	OFFER: "/admin/event/offer-made",
	APPLICATIONS_ANSWERS: "/admin/event/application-answer",
	LEAD_FORM_SUBMISSIONS: "/admin/event/lead-form-submissions",
	LEAD_FORM_SUBMISSION: "/admin/event/lead-form-submission",
	USERJOURNEY: "/admin/event/user-journey",
	USERINFO: "/admin/event/user",
	UPDATEEVENTFIELD: "/admin/event/edit",
	UPDATEUSERINFO: "/admin/event/update-userinfo",
	BIGGEST_IMPACT_OPTIONS: "/admin/event/ad-attributions",
};

export const PRODUCTS_API = {
	ALL: "/api/v1/sale/products",
} as const;

export const CREATIVE_BOARD_API = {
	CONNECTED_ACCOUNTS: "/api/v1/creative-board/connected-accounts",
	CAMPAIGNS: "/api/v1/creative-board/campaigns",
	HEADLINES: "/api/v1/creative-board/headlines",
	HEADLINES_TYPES: "/api/v1/creative-board/headlines",
	HEADLINE_VARIANTS: "/api/v1/creative-board/headline-variants",
	TEXT_GROUPS: "/api/v1/creative-board/text-groups",
	PROMOTE_TEXT_VARIANT: "/api/v1/creative-board/promote-text-variant",
	SET_TEXT_AS_VARIANT: "/api/v1/creative-board/set-text-as-variant",
	MOVE_TEXT_VARIANT: "/api/v1/creative-board/move-text-variant",
	MEDIA_TYPES: "/api/v1/creative-board/media",
	AUDIENCES: "/api/v1/creative-board/audiences",
	MEDIA: "/api/v1/creative-board/media",
	// MEDIA_TYPES: '/api/v1/creative-board/media',
	MEDIA_VARIANTS: "/api/v1/creative-board/media-variants", // <- add this (adjust if your backend differs)

	CAMPAIGN: "/api/v1/creative-board/campaign",
	ADGROUPS: "/api/v1/creative-board/adgroups",
	ADS: "/api/v1/creative-board/ads",
	CREATIVES: "/api/v1/creative-board/creatives",
	CAMPAIGN_METRICS_META: "/api/v1/creative-board/campaign-metrics",
	CAMPAIGN_METRICS_GOOGLE: "/api/v1/creative-board/campaign-metrics-google",
	CAMPAIGN_CONVERSIONS: "/api/v1/creative-board/campaign-conversions",

	CAMPAIGN_PLACEMENT_METRICS:
		"/api/v1/creative-board/campaign-placement-metrics",
	CAMPAIGN_COUNTRY_METRICS: "/api/v1/creative-board/campaign-country-metrics",
	CAMPAIGN_AGE_GENDER_METRICS:
		"/api/v1/creative-board/campaign-age-gender-metrics",
	CAMPAIGN_PAGE_METRICS: "/api/v1/creative-board/campaign-page-metrics",
	CAMPAIGN_AD_AUDIT_CONVERSIONS:
		"/api/v1/creative-board/campaign-ad-audit-conversions",
	// Metrics templates
	METRICS_TEMPLATES_LOAD: "/api/v1/creative-board/loadMetricsTemplates",
	METRICS_TEMPLATES_SAVE: "/api/v1/creative-board/saveMetricsTemplate",
	METRICS_TEMPLATES_UPDATE: "/api/v1/creative-board/updateMetricsTemplate",
} as const;
