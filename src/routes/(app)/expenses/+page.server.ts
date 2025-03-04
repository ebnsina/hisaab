import db from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const selectedMonth = url.searchParams.get('month');
	const selectedYear = url.searchParams.get('year');
	const selectedCategory = url.searchParams.get('category');

	const currentYear = new Date().getFullYear();

	let whereClause = {};

	if (selectedMonth && selectedYear) {
		const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
		const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0);
		whereClause = {
			...whereClause,
			date: {
				gte: startDate,
				lte: endDate
			}
		};
	}

	if (selectedCategory) {
		whereClause = {
			...whereClause,
			categoryId: selectedCategory
		};
	}

	const expenses = await db.expense.findMany({
		where: whereClause,
		include: {
			category: {
				select: { name: true }
			}
		},
		orderBy: {
			date: 'desc'
		}
	});

	const categories = await db.category.findMany();

	const statsYear = selectedYear ? parseInt(selectedYear) : currentYear;
	const monthlyExpenses = await db.expense.groupBy({
		by: ['date'],
		_sum: {
			amount: true
		},
		where: {
			date: {
				gte: new Date(statsYear, 0, 1),
				lte: new Date(statsYear, 11, 31)
			}
		}
	});

	const formattedMonthlyData = Array.from({ length: 12 }, (_, i) => {
		const month = new Date(0, i).toLocaleString('default', { month: 'short' });
		const monthData = monthlyExpenses.find((e) => e.date.getMonth() === i);
		return {
			month,
			amount: monthData?._sum.amount ?? 0
		};
	});

	// Yearly stats
	const yearlyExpenses = await db.expense.groupBy({
		by: ['date'],
		_sum: {
			amount: true
		},
		where: {
			date: {
				gte: new Date(currentYear - 4, 0, 1), // Last 5 years
				lte: new Date(currentYear, 11, 31)
			}
		}
	});

	const yearlyMap = new Map();
	yearlyExpenses.forEach((expense) => {
		const year = expense.date.getFullYear();
		const currentAmount = yearlyMap.get(year) || 0;
		yearlyMap.set(year, currentAmount + expense._sum.amount);
	});

	const formattedYearlyData = Array.from(yearlyMap.entries())
		.map(([year, amount]) => ({
			year,
			amount: amount ?? 0
		}))
		.sort((a, b) => b.year - a.year);

	// Get max amounts for scaling
	const maxMonthlyAmount = Math.max(...formattedMonthlyData.map((d) => d.amount));
	const maxYearlyAmount = Math.max(...formattedYearlyData.map((d) => d.amount));

	return {
		expenses,
		categories,
		monthlyExpenses: formattedMonthlyData,
		yearlyExpenses: formattedYearlyData,
		maxMonthlyAmount,
		maxYearlyAmount
	};
};

export const actions: Actions = {
	create: async (event) => {
		const formData = await event.request.formData();
		const description = formData.get('description') as string;
		const amount = parseFloat(formData.get('amount') as string);
		const date = formData.get('date') as string;
		const categoryId = formData.get('categoryId') as string;

		const userId = event.locals.user?.id;
		if (!userId) return;

		if (description.trim().length === 0) {
			return fail(400, { description, missing: true });
		}

		if (amount < 0) {
			return fail(400, { amount, missing: true });
		}

		if (!categoryId) {
			return fail(400, { categoryId, missing: true });
		}

		if (!date || isNaN(Date.parse(date))) {
			return fail(400, { date, invalid: true });
		}

		const category = await db.category.findUnique({
			where: { id: categoryId }
		});

		if (!category) {
			return fail(400, { categoryId, notFound: true });
		}

		await db.expense.create({
			data: {
				description,
				amount,
				date: new Date(date),
				categoryId,
				userId
			}
		});

		return { success: true };
	},

	destroy: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { categoryId: id, missing: true });
		}

		try {
			const category = await db.category.findUnique({
				where: { id }
			});

			if (!category) {
				return fail(404, { error: 'Category not found' });
			}

			await db.expense.delete({
				where: { id }
			});

			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};
