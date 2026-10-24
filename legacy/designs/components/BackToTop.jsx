import { useState, useEffect } from 'react'
import '../styles/rainbow.css'

function BackToTop() {
	const [state, setState] = useState({ visible: false, pct: 0 })

	useEffect(() => {
		let raf = null
		const onScroll = () => {
			if (raf) return
			raf = requestAnimationFrame(() => {
				raf = null
				const scrollY = window.scrollY
				const trackLength = document.documentElement.scrollHeight - window.innerHeight
				setState({
					visible: scrollY > 100,
					pct: trackLength > 0 ? Math.floor((scrollY / trackLength) * 100) : 0,
				})
			})
		}
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => {
			window.removeEventListener('scroll', onScroll, { passive: true })
			if (raf) cancelAnimationFrame(raf)
		}
	}, [])

	return (
		<div
			className={`back-to-top ${state.visible ? '' : 'invisible'}`}
			onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
		>
			<p className="text-rainbow">Back to top</p>
			<p className="blue">{state.pct}%</p>
		</div>
	)
}

export default BackToTop
