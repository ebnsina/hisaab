<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../../app.css';

	let { data, children } = $props();
</script>

<Header user={data.user} />

<main class="container mx-auto px-4 md:px-0">
	{@render children()}
</main>
