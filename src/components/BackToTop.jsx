import { useState, useEffect } from 'react'
import '../styles/rainbow.css'

function BackToTop() {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		// Add a scroll event listener to the window
		window.addEventListener('scroll', handleScroll)

		// Remove the scroll event listener when the component is unmounted
		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])

	const handleScroll = () => {
		// Check if the user has scrolled more than 100 pixels from the top of the page
		if (window.pageYOffset > 100) {
			setIsVisible(true)
		} else {
			setIsVisible(false)
		}
	}

	const handleBackToTopClick = () => {
		// Scroll to the top of the page when the user clicks the button
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<div className={`back-to-top text-rainbow ${isVisible ? '' : 'invisible'}`} onClick={handleBackToTopClick}>
			<p>Back to top</p>
		</div>
	)
}

export default BackToTop
