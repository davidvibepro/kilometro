import ButtonLink from '../components/ButtonLink'
import Card from '../components/Card'

// All text on this page comes from the project description (CLAUDE.md §1)
const features = [
  {
    title: 'Record everything',
    text: "Each vehicle's services, fuel fill-ups and other expenses, in one place.",
  },
  {
    title: 'Know what is due',
    text: 'When each service is next due, worked out from the odometer readings: by distance or by time, whichever comes first.',
  },
  {
    title: 'See the real cost',
    text: "Fuel efficiency, cost per kilometer and the month the vehicle's registration is due for renewal.",
  },
]

const audiences = [
  {
    title: 'Vehicle owners',
    text: 'Who want to keep one or more personal vehicles in good condition.',
  },
  {
    title: 'Small fleet managers',
    text: 'For example a small delivery business with several motorcycles, who need to see which vehicles are due for service and which ones cost the most to run.',
  },
]

function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-ink px-6 py-10 text-white shadow-sm sm:px-10 sm:py-14">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Vehicle maintenance and fuel tracker
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Kilometro</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Keep every vehicle's services, fuel fill-ups and expenses in one place, and know when the next service is
          due: by distance or by time, whichever comes first.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/dashboard">Go to the dashboard</ButtonLink>
          <ButtonLink to="/vehicles" variant="secondary">
            View vehicles
          </ButtonLink>
        </div>
      </section>

      <Card title="Why Kilometro">
        <div className="space-y-3 text-ink/80">
          <p>
            Most vehicle owners keep track of their change oil with a small sticker on the windshield, if at all. Other
            services such as tire rotation, brake checks and air filter replacement are easy to forget until something
            breaks, and a missed service usually turns into a more expensive repair.
          </p>
          <p>
            Fuel and repair receipts are scattered, so owners cannot tell how much a vehicle really costs to run. The
            problem grows for a small business with several delivery motorcycles.
          </p>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-semibold">What it does</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-t-4 border-primary">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{feature.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Who it is for</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {audiences.map((audience) => (
            <Card key={audience.title}>
              <h3 className="font-semibold">{audience.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{audience.text}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default LandingPage
