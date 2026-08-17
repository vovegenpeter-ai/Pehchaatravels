import CategoryForm from '@/components/admin/CategoryForm'

export const dynamic = 'force-dynamic'

export default async function EditCategoryPage({ params }) {
  const { id } = await params
  return (
    <>
      <div className="admin-header"><h1>Edit Category</h1></div>
      <CategoryForm categoryId={id} />
    </>
  )
}
