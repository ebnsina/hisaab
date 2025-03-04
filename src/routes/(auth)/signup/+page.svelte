<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign Up</title>
</svelte:head>

<section class="">
	<div class="grid min-h-screen grid-cols-1 gap-6 md:grid-cols-2">
		<div class="bg-slate-100"></div>
		<div class="flex flex-col justify-center px-10 md:px-40">
			<h2 class="mb-4 text-lg font-medium">Sign Up</h2>

			<form method="POST" class="space-y-4" use:enhance>
				<div>
					<label class="label" for="email">Email</label>
					<input
						class="input"
						type="email"
						id="email"
						name="email"
						placeholder="Email Address"
						value={form?.email ?? ''}
					/>

					{#if form?.error?.email}
						<p class="mt-1 text-xs text-rose-500">{form.error.email}</p>
					{/if}
				</div>
				<div>
					<label class="label" for="password">Password</label>
					<input
						class="input"
						type="password"
						name="password"
						id="password"
						placeholder="Password"
					/>
					{#if form?.error?.password}
						<p class="mt-1 text-xs text-rose-500">{form.error.password}</p>
					{/if}
				</div>

				<div class="mt-10 flex items-center justify-between">
					<a class="text-sm text-slate-600 hover:underline" href="/signin"
						>Sign in to your account</a
					>
					<button class="btn btn-primary" type="submit">Sign up</button>
				</div>
			</form>
		</div>
	</div>
</section>
