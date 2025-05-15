 
import { MessageSquare, Search, Library, UserCircle, Lock, BarChart3 } from "lucide-react"
import { Navbar } from "../components/layout/navbar"
import { FeatureCard } from "../components/FeatureCard"

export default function HomePage() {
 

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Welcome to DocsAI, How can I help you today?</h1>
            <p className="text-gray-600">
              Train your documents, chat with your documents, and create chatbots that solves queries for you and your
              users.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8 text-blue-500" />}
              title="Chat with AI"
              description="Ask any question related to documents."
              href="/chat"
            />

            <FeatureCard
              icon={<Search className="h-8 w-8 text-blue-500" />}
              title="Documents search using prompt"
              description="Find specific information from your documents and learning of it."
              href="/search"
            />

            <FeatureCard
              icon={<Library className="h-8 w-8 text-blue-500" />}
              title="Documents library"
              description="See all uploaded documents in the system."
              href="/documents"
            />

            <FeatureCard
              icon={<UserCircle className="h-8 w-8 text-blue-500" />}
              title="Personal info"
              description="Set your personal details."
              href="/profile"
            />

            <FeatureCard
              icon={<Lock className="h-8 w-8 text-blue-500" />}
              title="Login & security"
              description="Manage your password and account."
              href="/security"
            />

            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-blue-500" />}
              title="Dashboard"
              description="Get your overall stats if you manage several properties on DocsAI."
              href="/stats"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
