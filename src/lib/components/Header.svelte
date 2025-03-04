<script lang="ts">
	import Logo from './Logo.svelte';

	const { user } = $props();
</script>

<header class="py-4">
	<div class="container mx-auto flex items-center justify-between px-4 md:px-0">
		<Logo />

		{#if user}
			<div class="flex items-center space-x-6">
				<a class="text-sm text-slate-600 hover:text-slate-700" href="/expenses">Expenses</a>

				<form method="POST" action="/signout">
					<button type="submit" class="btn btn-outline">Sign Out</button>
				</form>
			</div>
		{:else}
			<a class="btn btn-outline" href="/signin">Sign in</a>
		{/if}
	</div>
</header>
