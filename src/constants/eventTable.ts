// src/constants/eventTable.ts

export const columnsMap: Record<string, string[]> = {
	Users: [
		"Date Joined",
		"User Journey",
		"Name",
		"Email",
		"Phone",
		"First Source",
		"Last Source",
		"Amount Billed",
		"Amount Paid",
	],
	"Lead Form Submissions": [
		"Date",
		"User Journey",
		"Name",
		"Email",
		"Phone",
		"First Source",
		"Last Source",
		"Biggest Impact 30",
		"Income",
		"Location",
		"Device Type",
	],
	Applications: [
		"Date",
		"App Name",
		"User Journey",
		"Name",
		"Email",
		"Phone",
		"Grade",
		"Qualified",
		"Form Answers",
		"First Source",
		"Last Source",
		"Biggest Impact 30",
		"Location",
		"Device Type",
	],
	"Booked Calls": [
		"Date",
		"Booking Name",
		"Booking Owner",
		"User Journey",
		"Booked Call With",
		"Status",
		"Show Status",
		"Confirmation Status",
		"Name",
		"Email",
		"Phone",
		"Grade",
		"Qualified",
		"Call Details",
		"First Source",
		"Last Source",
		"Biggest Impact 30",
		"Location",
		"Device Type",
	],
	Sets: [
		"Date",
		"User Journey",
		"Show Status",
		"Name",
		"Email",
		"Phone",
		"Set Details",
		"First Source",
		"Last Source",
		"Biggest Impact 30",
	],
	"Offers Made": [
		"Date",
		"User Journey",
		"Product Name",
		"Name",
		"Email",
		"Phone",
		"First Source",
		"Last Source",
		"Biggest Impact 30",
	],
	Sales: [
		"Date",
		"Product Name",
		"User Journey",
		"Funnel Type",
		"Quantity",
		"Name",
		"Email",
		"Phone",
		"Total Amount",
		"Amount Paid",
		"Cost of Goods",
		"Shipping Cost",
		"Taxes",
		"Refund",
		"Rebill Period",
		"Time Period Amount",
		"Rebill Price",
		"Number of Rebills",
		"Item Discount",
		"Order Name",
		"Order ID",
		"First Source",
		"Last Source",
		"Biggest Impact 30",
		"Location",
		"Device Type",
	],
	"Add To Cart": [
		"Date",
		"User Journey",
		"Product Name",
		"Name",
		"Email",
		"Phone",
		"First Source",
		"Last Source",
		"Biggest Impact 30",
		"Page URL",
	],
	"Checkout Initiated": [
		// "Select",
		"Date",
		"User Journey",
		"Product Name",
		"Name",
		"Email",
		"Phone",
		"First Source",
		"Last Source",
		"Biggest Impact 30",
		// "Actions",
	],
};

export const dummyDataMap: Record<string, any[]> = {
	Users: [
		{
			id: 1,
			dateJoined: "2025-06-14",
			userJourney: "Signup",
			name: "John Doe",
			email: "john@example.com",
			phone: "123-456-7890",
			firstSource: "Facebook",
			lastSource: "Google",
			amountBilled: 100,
			amountPaid: 100,
		},
		{
			id: 2,
			dateJoined: "2025-06-13",
			userJourney: "Signup",
			name: "Jane Smith",
			email: "jane@example.com",
			phone: "987-654-3210",
			firstSource: "Instagram",
			lastSource: "Direct",
			amountBilled: 200,
			amountPaid: 150,
		},
	],
	// ...other dummy data as in your original file...
};

export const getColKeyMap = (
	selectedOption: string
): Record<string, string> => ({
	// Common fields
	"Date Joined": selectedOption === "Users" ? "date_joined" : "date",
	Date: selectedOption === "Sales" ? "sale_date" : "date",

	// Name, Email, Phone fields
	Name: "name",
	Email: "email",
	Phone: "phone",

	// Source fields - these should map to the actual database fields
	"First Source": "first_source", // This will contain the JSON string
	"Last Source": "last_source", // This will contain the JSON string
	"Biggest Impact 30": "biggest_impact_30", // This will contain the JSON string

	// Individual source components (if needed separately)
	"First Click Ad ID": "first_click_ad_id",
	"First Click Name": "first_click_name",
	"First Click Type": "first_click_type",
	"Last Click Ad ID": "last_click_ad_id",
	"Last Click Name": "last_click_name",
	"Last Click Type": "last_click_type",
	"Biggest Impact 30 Ad ID": "biggest_impact_30_ad_id",
	"Biggest Impact 30 Name": "biggest_impact_30_name",
	"Biggest Impact 30 Type": "biggest_impact_30_type",

	// Sets specific fields
	"Set Details": "set_details",
	"Show Status":
		selectedOption === "Booked Calls"
			? "show_status"
			: selectedOption === "Sets"
			? "show_status"
			: "showStatus",

	// Offers Made specific fields
	"Product Name":
		selectedOption === "Sales"
			? "product_name"
			: selectedOption === "Offers Made"
			? "product_name"
			: "productName",

	// Amount fields
	"Amount Billed":
		selectedOption === "Users" ? "amount_billed" : "amountBilled",
	"Amount Paid":
		selectedOption === "Users"
			? "amount_paid"
			: selectedOption === "Sales"
			? "amount_paid"
			: "amountPaid",

	// Application and Booked Calls fields
	"App Name": "app_name",
	"Booking Name": "booking_name",
	"Booked Call With": "booked_call_with",
	Status: "status",
	"Confirmation Status":
		selectedOption === "Booked Calls"
			? "confirmed_status"
			: "confirmationStatus",
	"Call Details":
		selectedOption === "Booked Calls" ? "call_details" : "callDetails",
	Grade: selectedOption === "Booked Calls" ? "grade" : "grade",
	Qualified: selectedOption === "Booked Calls" ? "qualified" : "qualified",
	Location: selectedOption === "Booked Calls" ? "city" : "location",
	"Device Type":
		selectedOption === "Applications" || selectedOption === "Booked Calls"
			? "device_type"
			: "deviceType",
	"Booking Owner": "booking_owner",

	// Sales specific fields
	"Funnel Type": selectedOption === "Sales" ? "funnel_type" : "funnelType",
	"Total Amount": selectedOption === "Sales" ? "total_amount" : "totalAmount", // Using amount_paid as Total Amount
	"Cost of Goods":
		selectedOption === "Sales" ? "cost_of_goods" : "costOfGoods",
	"Shipping Cost":
		selectedOption === "Sales" ? "shipping_cost" : "shippingCost",
	Taxes: selectedOption === "Sales" ? "taxes" : "taxes",
	Refund: selectedOption === "Sales" ? "refund_amount" : "refund",
	"Rebill Period":
		selectedOption === "Sales" ? "rebill_period" : "rebillPeriod",
	"Time Period Amount": "time_period_amount",
	"Rebill Price": selectedOption === "Sales" ? "rebill_price" : "rebillPrice",
	"Number of Rebills":
		selectedOption === "Sales" ? "number_of_rebills" : "numberOfRebills",
	"Item Discount": "discount",
	"Order Name": "order_name",
	"Order ID": "order_id",
	Quantity: selectedOption === "Sales" ? "quantity" : "quantity",
});
