import { useParams } from 'react-router'
import PageHeader from '../components/PageHeader'

// Placeholder: this page is built in CP6.3
// One page for both routes: /vehicles/new (no id) and /vehicles/:id/edit (has an id)
function VehicleFormPage() {
  const { id } = useParams()
  return <PageHeader title={id ? 'Edit vehicle' : 'Add vehicle'} description="This page is not built yet." />
}

export default VehicleFormPage
