import {
	createSession,
	generateSessionToken,
	hashPassword,
	setSessionTokenCookie
} from '$lib/server/auth';
import db from '$lib/server/db';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const schema = z.object({
	email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
	password: z.string().min(8, { message: 'Be at least 8 characters long' }).trim()
});

export const load = (async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}

	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const validatedFields = schema.safeParse({
			email,
			password
		});

		if (!validatedFields.success) {
			return fail(400, {
				email,
				error: validatedFields.error.flatten().fieldErrors
			});
		}

		const user = await db.user.findFirst({ where: { email } });
		if (user) {
			return fail(400, { incorrect: true });
		}

		const passwordHash = await hashPassword(password);

		try {
			const user = await db.user.create({
				data: { email, password: passwordHash }
			});

			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, user.id);
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (error) {
			console.log(error);
			return fail(500, { message: 'An error has occurred' });
		}

		return redirect(302, '/');
	}
} satisfies Actions;
