export function formatCurrency(amount: number, decimals = 2) {
	return new Intl.NumberFormat('en-BD', {
		style: 'currency',
		currency: 'BDT',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(amount);
}
