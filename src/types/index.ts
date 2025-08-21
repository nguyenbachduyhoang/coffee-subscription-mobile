export interface User {
	id: string;
	email: string;
	name: string;
	phone: string;
}

export interface Package {
	id: string;
	name: string;
	price: number;
	duration: string;
	cupsPerDay: number;
	image: string;
	benefits: string[];
	popular?: boolean;
}

export interface Purchase {
	id: string;
	packageId: string;
	packageName: string;
	price: number;
	paymentMethod: 'momo' | 'cod';
	status: 'completed' | 'pending';
	date: string;
	address?: string;
}

export interface ContactMessage {
	id: string;
	name: string;
	email: string;
	phone: string;
	message: string;
	date: string;
}
