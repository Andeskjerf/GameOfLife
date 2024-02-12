const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let width, height, cellSize
let simRunning = false
let drawing = false
const liveColor = 'white'
const cursorColor = '#2d2d2d'

let cells = new Map()
let cursorPos = {
  x: 0,
  y: 0,
}

function setup() {
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
  cellSize = 10

  window.addEventListener('resize', onResize)
  canvas.addEventListener('mousedown', () => (drawing = true))
  canvas.addEventListener('mouseup', () => (drawing = false))
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('keydown', onKeyDown)

  // we don't want the context menu on right click
  canvas.oncontextmenu = function (e) {
    e.preventDefault()
    e.stopPropagation()
  }
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

function onResize() {
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
}

function onMouseMove(e) {
  const { x, y } = getCursorPosition(canvas, e)
  const xIndex = findXIndex(x)
  const yIndex = findYIndex(y)

  cursorPos.x = xIndex
  cursorPos.y = yIndex

  if (drawing) {
    let coord = getCoordKey(xIndex, yIndex)
    // BUG: right click doesn't work here for some reason??
    // if (e.button == 2 && cells.get(coord)) {
    //   cells.delete(coord)
    //   return
    // }

    cells.set(coord, { x: xIndex, y: yIndex })
  }
}

function onKeyDown(e) {
  switch (e.code) {
    case 'Space':
      simRunning = !simRunning
      break
    case 'KeyG':
      cells.clear()
      generateRandomPattern()
      break
    case 'KeyC':
      cells.clear()
      break
  }
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y }
}

function generateRandomPattern() {
  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      if (Math.random() >= 0.9) {
        let xPos = findXIndex(x)
        let yPos = findYIndex(y)
        cells.set(getCoordKey(xPos, yPos), { x: xPos, y: yPos })
      }
    }
  }
}

function isWithinWindow(x, y) {
  return x < width && y < height && x >= 0 && y >= 0
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
    if ((result.count == 2 || result.count == 3) && isWithinWindow(v.x, v.y)) {
      newCellMap.set(k, v)
    }
  })

  // any dead cells with exactly 3 neighbors becomes a live cell
  deadNeighbors.forEach((e) => {
    const result = getNeighborCount(e.x, e.y)
    if (result.count == 3 && isWithinWindow(e.x, e.y)) {
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

  ctx.fillStyle = cursorColor
  ctx.fillRect(
    cursorPos.x * cellSize,
    cursorPos.y * cellSize,
    cellSize,
    cellSize,
  )
}

function loop() {
  if (simRunning) updateCells()
  draw()
  window.requestAnimationFrame(loop)
}

setup()

window.requestAnimationFrame(loop)
