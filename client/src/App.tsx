import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import FuelLogsPage from './pages/FuelLogsPage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import OwnerDetailsPage from './pages/OwnerDetailsPage'
import OwnersPage from './pages/OwnersPage'
import RemindersPage from './pages/RemindersPage'
import ReportsPage from './pages/ReportsPage'
import ServiceLogsPage from './pages/ServiceLogsPage'
import ServiceTypesPage from './pages/ServiceTypesPage'
import VehicleDetailsPage from './pages/VehicleDetailsPage'
import VehicleFormPage from './pages/VehicleFormPage'
import VehiclesPage from './pages/VehiclesPage'

// The 13 pages of CLAUDE.md §7. All of them render inside <Layout>.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/vehicles/new" element={<VehicleFormPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
        <Route path="/vehicles/:id/edit" element={<VehicleFormPage />} />
        <Route path="/service-logs" element={<ServiceLogsPage />} />
        <Route path="/fuel-logs" element={<FuelLogsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/owners" element={<OwnersPage />} />
        <Route path="/owners/:id" element={<OwnerDetailsPage />} />
        <Route path="/service-types" element={<ServiceTypesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
