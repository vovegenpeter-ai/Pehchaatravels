import CategoryForm from '@/components/admin/CategoryForm'

export const dynamic = 'force-dynamic'

export default function NewCategoryPage() {
  return (
    <>
      <div className="admin-header"><h1>Add Category</h1></div>
      <CategoryForm />
    </>
  )
}
