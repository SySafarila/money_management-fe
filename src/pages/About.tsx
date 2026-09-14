import { Button } from "@/components/ui/button.tsx"
import { useState } from "react"

export function About() {
  const [n, setN] = useState<number>(0)
  const handleCLick = (): void => {
    console.log("clicked")
    setN(n + 1)
  }
  return (
    <div>
      <p>Lorem</p>
      <Button className="mt-2" onClick={handleCLick}>
        Button {n}
      </Button>
    </div>
  )
}

export default About
