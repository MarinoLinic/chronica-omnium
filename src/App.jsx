import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Home'
import NotFound from './NotFound'

const Event = lazy(() => import('./components/Event'))
const Timeline = lazy(() => import('./components/Timeline'))

const PageLoader = () => (
	<div className="flex min-h-screen items-center justify-center text-sm text-slate-400">Loading…</div>
)

function App() {
	return (
		<Suspense fallback={<PageLoader />}>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/:eventId" element={<Event />} />
				<Route path="/timeline" element={<Timeline />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Suspense>
	)
}

export default App
