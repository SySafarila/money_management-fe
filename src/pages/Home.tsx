import { Link } from "@tanstack/react-router"

export function Home() {
  return (
    <div>
      <p>Lorem</p>
      <Link to="/about">
        About
      </Link>
    </div>
  )
}

export default Home
