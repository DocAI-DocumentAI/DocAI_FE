import { Link } from "react-router-dom";

 

export function Logo() {
  return (
    <Link to="/" className="mb-8 inline-block">
      <h1 className="text-2xl font-medium">
        Docs<span className="text-blue-500">+</span>AI
      </h1>
    </Link>
  )
}
