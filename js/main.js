const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let width, height, cellSize
let simRunning = false
const liveColor = 'black'
const deadColor = 'white'

let cells = []

function setup() {
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
  cellSize = Math.floor(width / 30)

  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('keydown', onKeyDown)
}

function findXIndex(x) {
  return Math.floor(x / cellSize)
}

function findYIndex(y) {
  return Math.floor(y / cellSize)
}

function onMouseDown(e) {
  const { x, y } = getCursorPosition(canvas, e)
  const xIndex = findXIndex(x)
  const yIndex = findYIndex(y)
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].xIndex === xIndex && cells[i].yIndex === yIndex) {
      cells.splice(i, 1)
      return
    }
  }
  cells.push({ yIndex, xIndex })
}

function onKeyDown(e) {
  if (e.code === 'Space') {
    simRunning = !simRunning
  }
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y }
}

function getNeighborCount(x, y) {
  let count = 0
  let deadCells = []
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) continue
			let oldCount = count
      for (let k = 0; k < cells.length; k++) {
        if (cells[k].xIndex === x + i && cells[k].yIndex === y + j) {
          count++
					break
        } 
      }
			if (oldCount == count) deadCells.push({ xIndex: x + i, yIndex: y + j })
    }
  }
  return { count, deadCells }
}

function updateCells() {
  for (let cell in cells) {
    const result = getNeighborCount(cells[cell].xIndex, cells[cell].yIndex)
    if (result.count < 2 || result.count > 3) {
      cells.splice(cell, 1)
    }
		for (let i = 0; i < result.deadCells.length; i++) {
			const deadResult = getNeighborCount(result.deadCells[i].xIndex, result.deadCells[i].yIndex)
			if (deadResult.count === 3) {
				cells.push({ xIndex: result.deadCells[i].xIndex, yIndex: result.deadCells[i].yIndex })
			}
		}
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  for (let cell in cells) {
    ctx.fillStyle = liveColor
    ctx.fillRect(
      cells[cell].xIndex * cellSize,
      cells[cell].yIndex * cellSize,
      cellSize,
      cellSize,
    )
  }
}

function loop() {
  if (simRunning) updateCells()
  draw()
}

setup()

setInterval(loop, 500)
