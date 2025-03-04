<script lang="ts">
	import { enhance } from '$app/forms';
	import { calculatePercentage, formatCurrency } from '$lib/utils';
	import { fly, slide } from 'svelte/transition';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const { data, form } = $props();

	let formVisible = $state(false);
	let filterVisible = $state(false);
	let monthExpenseVisible = $state(false);
	let yearExpenseVisible = $state(false);
	let creating = $state(false);
	let deleting: string[] = $state([]);
	let monthQuery = $state(page.url.searchParams.get('month') ?? '');
	let yearQuery = $state(page.url.searchParams.get('year') ?? '');
	let categoryQuery = $state(page.url.searchParams.get('category') ?? '');

	const totalAmount = $derived(data.expenses.reduce((sum, expense) => sum + expense.amount, 0));

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
	const months = Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		label: new Date(0, i).toLocaleString('default', { month: 'long' })
	}));

	function updateFilters(type: string, value: string) {
		const url = new URL(window.location.href);

		if (value) {
			url.searchParams.set(type, value);
		} else {
			url.searchParams.delete(type);
		}

		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	function clearFilters() {
		const url = new URL(window.location.href);

		monthQuery = '';
		yearQuery = '';
		categoryQuery = '';

		url.searchParams.delete('month');
		url.searchParams.delete('year');
		url.searchParams.delete('category');

		goto(url.toString(), {
			replaceState: true,
			keepFocus: true
		});
	}
</script>

<section class="space-y-10">
	<header class="flex items-center justify-between">
		<button
			class="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-600"
			onclick={() => (monthExpenseVisible = !monthExpenseVisible)}
			type="button">{monthExpenseVisible ? 'Close' : 'Month Expense'}</button
		>
		<button
			class="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-600"
			onclick={() => (yearExpenseVisible = !yearExpenseVisible)}
			type="button">{yearExpenseVisible ? 'Close' : 'Year Expense'}</button
		>
		<button
			class="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-600"
			onclick={() => (filterVisible = !filterVisible)}
			type="button">{filterVisible ? 'Close' : 'Filter'}</button
		>
	</header>

	{#if filterVisible}
		<div transition:fly={{ y: 40 }} class="rounded-xl border border-slate-200 bg-white p-6">
			<h2 class="mb-4 font-medium">Filters</h2>

			<div class="flex gap-4">
				<select
					name="month"
					class="input w-40"
					bind:value={monthQuery}
					onchange={(e) => updateFilters('month', (e.target as HTMLInputElement).value)}
				>
					<option value="">All Months</option>
					{#each months as month}
						<option value={month.value}>{month.label}</option>
					{/each}
				</select>

				<select
					name="year"
					class="input w-32"
					bind:value={yearQuery}
					onchange={(e) => updateFilters('year', (e.target as HTMLInputElement).value)}
				>
					<option value="">All Years</option>
					{#each years as year}
						<option value={year}>{year}</option>
					{/each}
				</select>

				<select
					name="category"
					class="input w-40"
					bind:value={categoryQuery}
					onchange={(e) => updateFilters('category', (e.target as HTMLInputElement).value)}
				>
					<option value="">All Categories</option>
					{#each data.categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>

				<button type="button" onclick={clearFilters}>Clear</button>
			</div>
		</div>
	{/if}

	<!-- Monthly Stats -->
	{#if monthExpenseVisible}
		<div transition:fly={{ y: 40 }} class="rounded-xl border border-lime-300 bg-white p-4 md:p-6">
			<h2 class="mb-6 text-center text-base font-medium md:text-lg">
				Monthly Expenses ({yearQuery || currentYear})
			</h2>
			<div class="overflow-x-auto">
				<div class="flex h-64 min-w-[600px] items-end gap-1 px-2 md:gap-2 md:px-4">
					{#each data.monthlyExpenses as { month, amount }}
						<div class="flex flex-1 flex-col items-center">
							<p class="mb-2 text-[10px] text-slate-600 md:text-xs">{formatCurrency(amount)}</p>
							<div class="relative h-40 w-3 bg-slate-100 md:w-4">
								<div
									class="absolute bottom-0 w-full rounded-t-sm bg-rose-500 transition-all duration-300"
									style="height: {calculatePercentage(amount, data.maxMonthlyAmount)}%"
								/>
							</div>
							<p class="mt-2 text-[10px] font-medium md:text-sm">{month}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Yearly Stats -->
	{#if yearExpenseVisible}
		<div transition:fly={{ y: 40 }} class="rounded-xl border border-lime-300 bg-white p-6">
			<h2 class="mb-6 text-center text-lg font-medium">Yearly Expenses Overview</h2>
			<div class="flex h-64 items-end justify-between gap-2 px-4">
				{#each data.yearlyExpenses as { year, amount }}
					<div class="flex flex-col items-center">
						<p class="mb-2 text-xs text-slate-600">{formatCurrency(amount)}</p>
						<div class="relative h-40 w-4 bg-slate-100">
							<div
								class="absolute bottom-0 w-full rounded-t-sm bg-lime-500 transition-all duration-300"
								style="height: {calculatePercentage(amount, data.maxYearlyAmount)}%"
							/>
						</div>
						<p class="mt-2 text-sm font-medium">{year}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if formVisible}
		<div>
			<h2 class="mb-2 font-medium">Add Expense</h2>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					creating = true;

					return async ({ update }) => {
						await update();
						creating = false;
					};
				}}
				class="space-y-4"
			>
				<input
					type="text"
					name="description"
					placeholder="Description"
					disabled={creating}
					defaultValue={form?.description ?? ''}
					class="input"
				/>

				<input
					type="number"
					name="amount"
					placeholder="Amount"
					disabled={creating}
					defaultValue={form?.amount ?? ''}
					class="input"
				/>

				<select name="categoryId" disabled={creating} class="input">
					<option value="" disabled selected>Select Category</option>
					{#each data.categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>

				<input
					type="date"
					name="date"
					disabled={creating}
					defaultValue={form?.date ?? ''}
					class="input"
				/>

				<div class="flex items-center justify-end space-x-4">
					<button type="button" onclick={() => (formVisible = false)} class="btn btn-outline"
						>Cancel</button
					>

					<button disabled={creating} class="btn btn-primary" type="submit"
						>{creating ? 'Saving' : 'Save'}</button
					>
				</div>
			</form>
		</div>
	{:else}
		<div class="flex items-center justify-between">
			<a class="text-sm text-slate-800 hover:underline" href="/categories">Categories</a>
			<button onclick={() => (formVisible = true)} class="btn btn-primary">Add New</button>
		</div>
	{/if}

	{#if data.expenses.length > 0}
		<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
			<table class="min-w-full table-auto">
				<thead>
					<tr class="border-b border-slate-200">
						<th class="px-4 py-2 text-left text-sm font-medium text-slate-700">Description</th>
						<th class="hidden px-4 py-2 text-left text-sm font-medium text-slate-700 sm:table-cell"
							>Category</th
						>
						<th class="px-4 py-2 text-left text-sm font-medium text-slate-700">Amount</th>
						<th class="hidden px-4 py-2 text-left text-sm font-medium text-slate-700 sm:table-cell"
							>Date</th
						>
						<th class="px-4 py-2 text-right text-sm font-medium text-slate-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.expenses.filter((e) => !deleting.includes(e.id)) as expense (expense.id)}
						<tr in:fly={{ y: 20 }} out:slide class="border-b border-slate-200">
							<td class="px-4 py-2 text-sm text-slate-800">
								<div>
									<span class="capitalize">{expense.description}</span>
									<span class="mt-1 block text-xs text-slate-500 sm:hidden">
										{expense.category.name} •
										{new Intl.DateTimeFormat('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										}).format(new Date(expense.date))}
									</span>
								</div>
							</td>
							<td class="hidden px-4 py-2 text-sm text-slate-600 sm:table-cell"
								>{expense.category.name}</td
							>
							<td class="px-4 py-2 text-sm text-lime-800">{formatCurrency(expense.amount)}</td>
							<td class="hidden px-4 py-2 text-sm text-slate-500 sm:table-cell">
								{new Intl.DateTimeFormat('en-US', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								}).format(new Date(expense.date))}
							</td>
							<td class="px-4 py-2">
								<div class="flex justify-end gap-2">
									<button class="btn btn-outline btn-sm">Edit</button>
									<form
										method="POST"
										action="?/destroy"
										use:enhance={({ cancel }) => {
											const confirmed = window.confirm(
												`Are you sure you want to delete "${expense.description}"?`
											);
											if (!confirmed) {
												cancel();
												return;
											}
											deleting = [...deleting, expense.id];
											return async ({ update }) => {
												await update();
												deleting = deleting.filter((id) => id !== expense.id);
											};
										}}
									>
										<input type="hidden" name="id" value={expense.id} />
										<button type="submit" class="btn btn-primary btn-sm">Delete</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="border-t border-slate-200 p-4">
				<div class="text-right text-base font-medium text-slate-700">
					Total: {formatCurrency(totalAmount)}
				</div>
			</div>
		</div>
	{:else}
		<p>No expense found.</p>
	{/if}
</section>
