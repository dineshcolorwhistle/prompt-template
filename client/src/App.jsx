import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Industry-Tested Prompt Template Platform
        </h1>
        <p className="text-xl text-gray-600">
          Curated marketplace for ready-to-use AI prompt templates.
        </p>
      </header>

      <main className="max-w-4xl w-full px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to the Platform
          </h2>
          <p className="text-gray-600 mb-6">
            This is the initial setup of the application. Tailwind CSS is now active and working correctly.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Get Started
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Learn More
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Prompt Template Platform. All rights reserved.
      </footer>
    </div>
  )
}

export default App
