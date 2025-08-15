
import { Suspense } from 'react'
import { StudyPage } from '@/components/study-page'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function Study() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" message="Cargando modo de estudio..." />}>
      <StudyPage />
    </Suspense>
  )
}
