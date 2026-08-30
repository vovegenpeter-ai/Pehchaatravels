import CategoryForm from '@/components/admin/CategoryForm'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage() {
  return (
    <>
      <div className="admin-header">
        <h1>Add Places Category</h1>
      </div>
      <CategoryForm />
    </>
  )
}
