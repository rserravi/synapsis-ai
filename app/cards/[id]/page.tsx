
import { CardViewPage } from '@/components/card-view-page'

interface PageProps {
  params: {
    id: string
  }
}

export default function CardPage({ params }: PageProps) {
  return <CardViewPage cardId={params.id} />
}
