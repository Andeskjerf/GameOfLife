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

  if (cells[yIndex] && cells[yIndex][xIndex]) {
    cells[yIndex][xIndex] = false
    return
  }

  cells[yIndex] = cells[yIndex] || []
  cells[yIndex][xIndex] = true
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
  let iterations = 0
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) continue
      if (cells[y + j] && cells[y + j][x + i]) {
        count++
      } else {
        deadCells[y + j] = deadCells[y + j] || []
        deadCells[y + j][x + i] = false
        iterations++
      }
    }
  }
  console.log(iterations)
  return { count, deadCells }
}

function updateCells() {
  let deadNeighbors = []
  for (let y in cells) {
    for (let x in cells[y]) {
      if (!cells[y][x]) continue
      const result = getNeighborCount(x, y)
      deadNeighbors = deadNeighbors.concat(result.deadCells)
      if (result.count < 2 || result.count > 3) {
        cells[y][x] = false
      } else if (result.count == 2 || result.count == 3) {
        cells[y][x] = true
      }
    }
  }
  for (let deadY in deadNeighbors) {
    for (let deadX in deadNeighbors[deadY]) {
      const deadResult = getNeighborCount(deadX, deadY)
      // console.log(deadNeighbors[deadY][deadX])
      if (deadResult.count == 3) {
        cells[deadY] = deadCells[deadY] || []
        cells[deadY][deadX] = deadCells[deadY][deadX] || true
				// console.log(cells[deadY][deadX])
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  for (let y in cells) {
    for (let x in cells[y]) {
      ctx.fillStyle = cells[y][x] ? liveColor : deadColor
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }
}

function loop() {
  if (simRunning) updateCells()
  draw()
}

setup()

setInterval(loop, 100)
