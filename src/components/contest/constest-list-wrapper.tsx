import { ContestList } from "./constest-list"

export function ContestListWrapper() {
  return (
    <div className="flex container flex-col gap-6 bg-muted p-4 rounded-lg">
      <ContestList />
    </div>
  )
}
