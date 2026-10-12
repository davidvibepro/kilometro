import { Link } from 'react-router'
import { getReminders } from '../api/reminders'
import ButtonLink from '../components/ButtonLink'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import ServiceStatusBadge from '../components/ServiceStatusBadge'
import StatTile from '../components/StatTile'
import { linkClasses } from '../components/tableStyles'
import { useApi } from '../hooks/useApi'
import type { RegistrationReminder, ServiceReminder } from '../types/reports'
import { formatDate, formatKm, formatRemaining } from '../utils/format'

// "6,500 km or Oct 20, 2026": the limits of the service that is due
function nextDueText(reminder: ServiceReminder) {
  const limits: string[] = []
  if (reminder.nextDueKm !== null) limits.push(formatKm(reminder.nextDueKm))
  if (reminder.nextDueDate !== null) limits.push(formatDate(reminder.nextDueDate))
  return limits.join(' or ')
}

function ServiceReminderCard({ reminder }: { reminder: ServiceReminder }) {
  const borderColor = reminder.status === 'overdue' ? 'border-overdue' : 'border-due-soon'
  return (
    <li className={`rounded-lg border-l-4 bg-white p-4 shadow-sm ${borderColor}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{reminder.serviceType.name}</p>
          <Link to={`/vehicles/${reminder.vehicle._id}`} className={`${linkClasses} text-sm`}>
            {reminder.vehicle.plateNumber}
          </Link>
          <span className="text-sm text-ink/70">
            {' '}
            · {reminder.vehicle.make} {reminder.vehicle.model}
          </span>
        </div>
        <ServiceStatusBadge status={reminder.status} />
      </div>
      <p className="mt-2 text-sm font-medium">{formatRemaining(reminder.kmRemaining, reminder.daysRemaining)}</p>
      <p className="text-sm text-ink/70">Due at {nextDueText(reminder)}</p>
      <ButtonLink
        to={`/service-logs?vehicle=${reminder.vehicle._id}`}
        variant="secondary"
        size="sm"
        className="mt-3"
      >
        Log this service
      </ButtonLink>
    </li>
  )
}

function RegistrationReminderCard({ reminder }: { reminder: RegistrationReminder }) {
  const thisMonth = reminder.status === 'due_this_month'
  return (
    <li className={`rounded-lg border-l-4 bg-white p-4 shadow-sm ${thisMonth ? 'border-due-soon' : 'border-ink/30'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">Registration renewal</p>
          <Link to={`/vehicles/${reminder.vehicle._id}`} className={`${linkClasses} text-sm`}>
            {reminder.vehicle.plateNumber}
          </Link>
          <span className="text-sm text-ink/70">
            {' '}
            · {reminder.vehicle.make} {reminder.vehicle.model}
          </span>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${thisMonth ? 'bg-due-soon text-white' : 'bg-ink/10 text-ink/70'}`}
        >
          {thisMonth ? 'This month' : 'Next month'}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink/70">
        Due in {reminder.registrationMonth}, from the last digit of the plate number
      </p>
    </li>
  )
}

function RemindersPage() {
  const { data: reminders, loading, error, refetch } = useApi(getReminders)

  function renderReminders() {
    if (loading) return <LoadingState message="Loading reminders..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!reminders || reminders.length === 0) {
      return <EmptyState message="Nothing is due. Every active vehicle is up to date." />
    }

    // Derived during render: the three groups, in the order the server sorted them
    const overdue = reminders.filter((item): item is ServiceReminder => item.kind === 'service' && item.status === 'overdue')
    const dueSoon = reminders.filter((item): item is ServiceReminder => item.kind === 'service' && item.status === 'due_soon')
    const registrations = reminders.filter((item): item is RegistrationReminder => item.kind === 'registration')

    const groups = [
      { title: 'Overdue services', items: overdue },
      { title: 'Due soon', items: dueSoon },
    ]

    return (
      <div className="space-y-8">
        <Card>
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Overdue" value={String(overdue.length)} />
            <StatTile label="Due soon" value={String(dueSoon.length)} />
            <StatTile label="Renewals" value={String(registrations.length)} />
          </div>
        </Card>

        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <section key={group.title}>
                <h2 className="mb-3 text-lg font-semibold">{group.title}</h2>
                <ul className="grid gap-3 md:grid-cols-2">
                  {group.items.map((reminder) => (
                    <ServiceReminderCard key={`${reminder.vehicle._id}-${reminder.serviceType._id}`} reminder={reminder} />
                  ))}
                </ul>
              </section>
            )
        )}

        {registrations.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Registration renewals</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {registrations.map((reminder) => (
                <RegistrationReminderCard key={reminder.vehicle._id} reminder={reminder} />
              ))}
            </ul>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders"
        description="Overdue and due-soon services and registration renewals, for active vehicles, most urgent first"
      />
      {renderReminders()}
    </div>
  )
}

export default RemindersPage
