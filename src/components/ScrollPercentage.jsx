import { useState, useEffect } from 'react'

const ScrollPercentage = () => {
	const [scrollPercentage, setScrollPercentage] = useState(0)

	useEffect(() => {
		function handleScroll() {
			const windowHeight = window.innerHeight
			const documentHeight = document.documentElement.scrollHeight
			const scrollTop = window.scrollY
			const trackLength = documentHeight - windowHeight
			const percentage = Math.floor((scrollTop / trackLength) * 100 + 1)
			setScrollPercentage(percentage)
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return <p className="blue">{scrollPercentage}%</p>
}

export default ScrollPercentage
