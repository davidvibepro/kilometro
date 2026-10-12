import { useLocation } from 'react-router'
import ButtonLink from '../components/ButtonLink'
import Card from '../components/Card'

// Shown for any URL that matches no route (path="*")
function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <Card className="mx-auto mt-8 max-w-md text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm break-all text-ink/70">There is no page at {pathname}.</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <ButtonLink to="/dashboard">Go to the dashboard</ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </Card>
  )
}

export default NotFoundPage
