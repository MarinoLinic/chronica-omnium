import React, { useEffect, useRef } from 'react'
import data from '../src/resources/World_History.json'

const Timeline = () => {
	const canvasRef = useRef(null)
	const filteredData = data.filter((item) => item.start > 0)

	useEffect(() => {
		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')
		let xvalues = []
		let xvaluesfinal = []
		let yvalues = []
		let yvaluesfinal = []

		filteredData.forEach((item) => {
			if (item.end === null) item.end = item.start

			let pointx = 30
			let pointy = item.start * 20

			let finalpointx = pointx
			let finalpointy = item.end * 20

			/////

			for (let i = 0; i < yvalues.length; i++) {
				if (yvalues[i] === pointy && xvalues[i] === pointx) {
					pointx = xvalues[i] + 300
					finalpointx = pointx
					i = 0
				}

				if (yvaluesfinal[i] === pointy && xvaluesfinal[i] === pointx) {
					pointx = xvaluesfinal[i] + 300
					finalpointx = pointx
					i = 0
				}

				if (yvaluesfinal[i] === finalpointy && xvaluesfinal[i] === pointx) {
					pointx = xvaluesfinal[i] + 300
					finalpointx = pointx
					i = 0
				}
			}

			/////

			ctx.fillStyle = 'green'
			ctx.fillRect(pointx, pointy, 10, 10)

			ctx.fillStyle = 'red'
			ctx.fillRect(finalpointx, finalpointy, 10, 10)

			ctx.beginPath()
			ctx.moveTo(pointx + 5, pointy + 5)
			ctx.lineTo(finalpointx + 5, finalpointy + 5)
			ctx.strokeStyle = 'gray'
			ctx.stroke()

			ctx.fillStyle = 'black'
			ctx.fillText(item.start, pointx + 20, pointy + 8)
			ctx.fillText(item.end, pointx + 20, finalpointy + 8)
			ctx.fillText(item.name, pointx + 50, pointy + 8)
			ctx.fillText(item.name, pointx + 50, finalpointy + 8)

			/////

			xvalues.push(pointx)
			yvalues.push(pointy)
			xvaluesfinal.push(finalpointx)
			yvaluesfinal.push(finalpointy)
		})
	}, [])

	return <canvas ref={canvasRef} width={5000} height={40500} />
}

export default Timeline
