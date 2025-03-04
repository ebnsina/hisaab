import db from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) {
		throw new Error('User not authenticated');
	}

	const categories = await db.category.findMany({
		where: { userId }
	});

	return { categories };
};

export const actions: Actions = {
	create: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name') as string;

		if (name.trim().length == 0) {
			return fail(400, { name, missing: true });
		}

		await db.category.create({
			data: { name }
		});

		return { success: true };
	},

	destroy: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		try {
			const category = await db.category.findUnique({
				where: { id }
			});

			if (!category) {
				return fail(404, { error: 'Category not found' });
			}

			await db.category.delete({
				where: { id }
			});

			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};
