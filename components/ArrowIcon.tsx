const ArrowIcon = ({ direction }: any) => {
	return (
		<svg
			className={`${direction === 'left' && 'transform-x-mirror'}`}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			viewBox="0 0 51.388 51.388"
		>
			<g>
				<g>
					<path
						d="M9.169,51.388c-0.351,0-0.701-0.157-0.93-0.463c-0.388-0.514-0.288-1.243,0.227-1.634l31.066-23.598L8.461,2.098
          C7.95,1.708,7.85,0.977,8.237,0.463c0.395-0.517,1.126-0.615,1.64-0.225l33.51,25.456L9.877,51.151
          C9.664,51.31,9.415,51.388,9.169,51.388z"
						stroke-width="3"
					/>
				</g>
			</g>
		</svg>
	)
}

export default ArrowIcon
