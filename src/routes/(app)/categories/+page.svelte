<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';

	const { data, form } = $props();

	let creating = $state(false);
	let deleting: string[] = $state([]);
	let showForm = $state(false);
</script>

<section class="space-y-10">
	<div>
		<div class="flex items-center justify-between">
			<h2 class="mb-2 font-medium">Categories</h2>
			<button onclick={() => (showForm = !showForm)} class="btn btn-primary" type="button">
				{showForm ? 'Cancel' : 'Add Category'}
			</button>
		</div>

		{#if showForm}
			<div transition:slide>
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						creating = true;

						return async ({ update }) => {
							await update();
							creating = false;
							showForm = false;
						};
					}}
					class="mt-4 space-y-4"
				>
					<input
						type="text"
						name="name"
						placeholder="Category Name"
						disabled={creating}
						defaultValue={form?.name ?? ''}
						class="input"
					/>

					<div class="mt-2 flex items-center justify-end">
						<button class="btn btn-primary" type="submit">{creating ? 'Saving' : 'Save'}</button>
					</div>
				</form>
			</div>
		{/if}
	</div>

	{#if data.categories.length > 0}
		<div class="overflow-x-auto">
			<table class="min-w-full table-auto">
				<thead>
					<tr class="border-b border-slate-200">
						<th class="px-4 py-2 text-left font-medium text-gray-700">Category Name</th>
						<th class="px-4 py-2 text-right font-medium text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.categories.filter((c) => !deleting.includes(c.id)) as category (category.id)}
						<tr class="border-b border-slate-200 hover:bg-gray-50">
							<td class="px-4 py-2">{category.name}</td>
							<td class="flex justify-end px-4 py-2 text-right">
								<div class="flex items-center space-x-2">
									<button
										class="rounded-xl bg-cyan-500 px-4 py-1 text-xs text-white transition duration-300 hover:bg-cyan-600"
									>
										Edit
									</button>

									<form
										method="POST"
										action="?/destroy"
										use:enhance={({ cancel }) => {
											const confirmed = window.confirm(
												`Are you sure you want to delete "${category.name}"?`
											);
											if (!confirmed) {
												cancel();
												return;
											}

											deleting = [...deleting, category.id];

											return async ({ update }) => {
												await update();
												deleting = deleting.filter((id) => id !== category.id);
											};
										}}
									>
										<input type="hidden" name="id" value={category.id} />
										<button
											type="submit"
											class="rounded-xl bg-rose-500 px-4 py-1 text-xs text-white transition duration-300 hover:bg-rose-600"
										>
											Delete
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-sm text-slate-600">No categories found.</p>
	{/if}
</section>
