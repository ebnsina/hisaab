export function formatCurrency(amount: number, decimals = 2) {
	return new Intl.NumberFormat('en-BD', {
		style: 'currency',
		currency: 'BDT',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(amount);
}

export function calculatePercentage(amount: number, maxAmount: number): number {
	if (maxAmount === 0) return 0;
	return Math.round((amount / maxAmount) * 100);
}
