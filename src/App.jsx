import { Route, Routes, Link, Navigate } from 'react-router-dom'
import Home from './Home'
import NotFound from './NotFound'
import Event from './components/Event'
import Timeline from './components/Timeline'

function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/:eventId" element={<Event />} />
				<Route path="/timeline" element={<Timeline />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</>
	)
}

export default App
