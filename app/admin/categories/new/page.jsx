import CategoryForm from '@/components/admin/CategoryForm'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage({ searchParams }) {
  const params = await searchParams
  const parentId = params?.parentId || null
  const type = params?.type || null

  return (
    <>
      <div className="admin-header">
        <h1>{parentId ? 'Add Subcategory' : 'Add Category'}</h1>
      </div>
      <CategoryForm prefillParentId={parentId} prefillType={type} />
    </>
  )
}
