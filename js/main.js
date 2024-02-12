const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let width, height, cellSize
let simRunning = false
const liveColor = 'black'
const deadColor = 'white'

let cells = new Map()

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

function getCoordKey(x, y) {
  return `x${x}_y${y}`
}

function onMouseDown(e) {
  const { x, y } = getCursorPosition(canvas, e)
  const xIndex = findXIndex(x)
  const yIndex = findYIndex(y)

  let coord = getCoordKey(xIndex, yIndex)
  if (cells.get(coord)) {
    cells.delete(coord)
    return
  }

  cells.set(coord, { x: xIndex, y: yIndex })
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
  // get each adjacent cell
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) continue
      if (cells.get(getCoordKey(x + i, y + j))) count++
      else deadCells.push({ x: x + i, y: y + j })
    }
  }
  return { count, deadCells }
}

function updateCells() {
  let deadNeighbors = []
  let newCellMap = new Map()

  // only live cells with either 2 or 3 neighbors pass on to the next generation
  cells.forEach((v, k) => {
    const result = getNeighborCount(v.x, v.y)
    deadNeighbors = deadNeighbors.concat(result.deadCells)
    if (result.count == 2 || result.count == 3) {
      newCellMap.set(k, v)
    }
  })

  // any dead cells with exactly 3 neighbors becomes a live cell
  deadNeighbors.forEach((e) => {
    const result = getNeighborCount(e.x, e.y)
    if (result.count == 3) {
      newCellMap.set(getCoordKey(e.x, e.y), e)
    }
  })

  cells = newCellMap
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = liveColor
  cells.forEach((e) =>
    ctx.fillRect(e.x * cellSize, e.y * cellSize, cellSize, cellSize),
  )
}

function loop() {
  if (simRunning) updateCells()
  draw()
}

setup()

setInterval(loop, 100)
