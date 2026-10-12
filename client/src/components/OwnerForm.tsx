import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toApiError } from '../api/axios'
import { createOwner, updateOwner } from '../api/owners'
import { useToast } from '../hooks/useToast'
import { ownerSchema, toOwnerPayload, type OwnerFormValues } from '../schemas/ownerSchema'
import type { Owner } from '../types/owner'
import Button from './Button'
import Card from './Card'
import ErrorState from './ErrorState'
import Input from './Input'
import Select from './Select'

interface OwnerFormProps {
  owner?: Owner // given = edit this owner, missing = add a new one
  onSaved: (owner: Owner) => void
  onCancel: () => void
}

// The add and edit owner form, used on the Owners page and on the owner details page
function OwnerForm({ owner, onSaved, onCancel }: OwnerFormProps) {
  const showToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      fullName: owner?.fullName ?? '',
      email: owner?.email ?? '',
      contactNumber: owner?.contactNumber ?? '',
      type: owner?.type ?? '',
    },
  })

  async function onSubmit(values: OwnerFormValues) {
    setServerError(null)
    try {
      const payload = toOwnerPayload(values)
      const saved = owner ? await updateOwner(owner._id, payload) : await createOwner(payload)
      showToast(owner ? 'Owner updated' : 'Owner added')
      onSaved(saved)
    } catch (error) {
      // e.g. 400 "email already exists" from the server
      setServerError(toApiError(error).message)
    }
  }

  return (
    <Card title={owner ? 'Edit owner' : 'Add owner'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <ErrorState title="Could not save the owner" message={serverError} />}
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
          <Input
            label="Contact number"
            inputMode="numeric"
            placeholder="09171234567"
            error={errors.contactNumber?.message}
            {...register('contactNumber')}
          />
          <Input label="Email (optional)" type="email" error={errors.email?.message} {...register('email')} />
          <Select
            label="Type"
            placeholder="Not specified"
            options={[
              { value: 'individual', label: 'Individual' },
              { value: 'business', label: 'Business' },
            ]}
            error={errors.type?.message}
            {...register('type')}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save owner'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default OwnerForm
