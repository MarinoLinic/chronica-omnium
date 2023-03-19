import '../styles/rainbow.css'

const Title = () => {
	return (
		<div className="padding-y center">
			<h1 className="text-rainbow">A Brief History of the World</h1>
			<h3 className="padding-y">
				By{' '}
				<a className="blue" href="https://linic.net">
					Marino Linić
				</a>
			</h3>
		</div>
	)
}

export default Title
