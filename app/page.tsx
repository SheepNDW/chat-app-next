import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Welcome to AI Chat Platform',
  description: 'Your AI-powered conversation platform for projects and chats',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600">AI Chat</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Manage your projects and have AI-powered conversations in one
            platform. Organize your work and get intelligent assistance whenever
            you need it.
          </p>
          <div className="space-x-4">
            <Link
              href="/chats"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Chatting
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
