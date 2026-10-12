// One look for every list in the app (§8): a table from the md breakpoint up,
// and stacked cards below md. Each list page renders both; CSS shows one of them.
export const tableWrapperClasses = 'hidden overflow-x-auto rounded-lg bg-white shadow-sm md:block'
export const tableClasses = 'w-full text-left text-sm'
export const theadRowClasses = 'border-b border-ink/10 text-xs font-semibold tracking-wide text-ink/60 uppercase'
export const thClasses = 'px-4 py-3'
export const rowClasses = 'border-b border-ink/10 last:border-0'
export const tdClasses = 'px-4 py-3 align-top'

export const cardListClasses = 'space-y-3 md:hidden'
export const cardItemClasses = 'rounded-lg bg-white p-4 shadow-sm'

// The same, for a list that sits inside a <Card> (no second white box and shadow)
export const nestedTableWrapperClasses = 'hidden overflow-x-auto md:block'
export const nestedCardItemClasses = 'rounded-lg bg-surface p-4'

export const linkClasses = 'font-semibold text-primary hover:underline'
