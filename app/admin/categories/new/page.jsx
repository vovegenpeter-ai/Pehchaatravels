import CategoryForm from '@/components/admin/CategoryForm'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage({ searchParams }) {
  const params = await searchParams
  const type = params?.type || null

  return (
    <>
      <div className="admin-header">
        <h1>Add Category</h1>
      </div>
      <CategoryForm prefillType={type} />
    </>
  )
}
