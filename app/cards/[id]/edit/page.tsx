
import { EditCardPage } from '@/components/edit-card-page'

interface PageProps {
  params: {
    id: string
  }
}

export default function EditCard({ params }: PageProps) {
  return <EditCardPage cardId={params.id} />
}
