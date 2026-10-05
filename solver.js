// Solving using Old Pochman's method(Blindfolded method) (easiest to code)

// Edge Buffer: UR; Target Edge: UL
const EDGE_BUFFER = [5, 28]
// Corner Buffer: LBU; Target Corner: DFR
const CORNER_BUFFER = [0, 9, 38]

// Algorithms
const EDGE_SWAP = "R U R' U' R' F R2 U' R' U' R U R' F'" // T-Perm
const CORNER_SWAP = "R U' R' U' R U R' F' R U R' U' R' F R" // Almost Y-Perm
const PARITY_ALG = "R U R' F' R U2 R' U2 R' F R U R U2 R' U'" // R-Perm

// Face order: U, L, F, R, B, D
// Edges and corners on each face are ordered top, left, right, bottom
const EDGE_SETUPS = ["R2U'R2", "", "", "R2UR2", "L'EL'", "EL'", "E'L", "LEL'", "MD'L2", "L'", "E2L", "MDL2", "", "E'L'", "EL", "D'MDL2", "M'DL2", "E2L'", "L", "M'D'L2", "D'L2", "L2", "D2L2", "DL2"]
const CORNER_SETUPS = ["", "R2", "F2", "F2D", "", "F'D", "D'R", "F'", "FR'", "R'", "F2R'", "D'F'", "F", "R'F", "DR", "R2F", "RD'", "", "R", "DF'", "D", "", "D2", "D'"]

// Helper lists
const SURROUNDING_FACES = [[4, 1, 3, 2], [0, 4, 2, 5], [0, 1, 3, 5], [0, 2, 4, 5], [0, 3, 1, 5], [2, 1, 3, 4]]
const CORNER_INDICES = [0, 2, 6, 8]

let cubeState
let nswaps = 0;
const centers = []

function reverseSetup(setup) {
    let reverse = ""
    for (let i = setup.length-1; i >= 0; i--) {
        if (i > 0 && (setup[i] == "'" || setup[i] == "2")) {
            if (setup[i] == "'") {
                reverse += setup[i-1]
            } else {
                reverse += setup[i-1] + "2"
            }
            i--;
        } else {
            reverse += setup[i] + "'"
        }
    }

    return reverse
}

function solveEdges() {
    let solution = ''

    // Solving edges
    let eb1 = cubeState[EDGE_BUFFER[0]]
    let eb2 = cubeState[EDGE_BUFFER[1]]
    while (true) {
        while (eb1 != centers[0] || eb2 != centers[3]) {
            if (eb1 == centers[3] && eb2 == centers[0]) break // Flipped buffer(find other flipped edge and fix it)
            console.log('Edge buffer: ')
            console.log(eb1, eb2)
            
            let dest_f1 = centers.indexOf(eb1)
            let dest_f2 = centers.indexOf(eb2)
            console.log('Destination faces: ')
            console.log(dest_f1, dest_f2)

            let edgeno1 = SURROUNDING_FACES[dest_f1].indexOf(dest_f2)
            let dest_ind1 = (dest_f1*9) + (edgeno1*2) + 1
            // Calculating edge pair's index
            let edgeno2 = SURROUNDING_FACES[dest_f2].indexOf(dest_f1)
            let dest_ind2 = (dest_f2*9) + (edgeno2*2) + 1

            let edge_setup_ind = (dest_f1*4) + edgeno1
            console.log('Edge setup: ')
            console.log(EDGE_SETUPS[edge_setup_ind])

            solution += EDGE_SETUPS[edge_setup_ind]
            solution += EDGE_SWAP
            solution += reverseSetup(EDGE_SETUPS[edge_setup_ind])
            nswaps++
            console.log('No. of swaps: ', nswaps)
            if (nswaps > 25) break; // Somethings wrong

            // Updating cube state to swap edges
            cubeState[EDGE_BUFFER[0]] = cubeState[dest_ind1]
            cubeState[EDGE_BUFFER[1]] = cubeState[dest_ind2]
            cubeState[dest_ind1] = eb1
            cubeState[dest_ind2] = eb2

            // Updating edge buffers with new colors
            eb1 = cubeState[EDGE_BUFFER[0]]
            eb2 = cubeState[EDGE_BUFFER[1]]

            console.log('NEW CUBE STATE')
            for (let i = 0; i < 6; i++) {
                console.log(cubeState.slice(i*9, (i*9)+9))
            }
            console.log('NEW CUBE STATE')
            console.log()
        }
        if (nswaps > 25) break;
        // Start new cycle if needed
        let unsolvedEdgeInd = getUnsolvedEdge()
        if (unsolvedEdgeInd !== -1) {
            let f1 = Math.floor(unsolvedEdgeInd/9)
            let edgeno1 = Math.floor((unsolvedEdgeInd%9)/2)
            let f2 = SURROUNDING_FACES[f1][edgeno1]
            let edgeno2 = SURROUNDING_FACES[f2].indexOf(f1)
            let dest_ind2 = (f2*9) + (edgeno2*2) + 1 // dest_ind1 is unsolvedEdgeInd

            console.log('Starting new cycle at ')
            console.log(f1, f2)
            console.log(cubeState[unsolvedEdgeInd], cubeState[dest_ind2])

            // Swapping to unsolved edge
            let edge_setup_ind = (f1 * 4) + edgeno1
            solution += EDGE_SETUPS[edge_setup_ind]
            solution += EDGE_SWAP
            solution += reverseSetup(EDGE_SETUPS[edge_setup_ind])
            nswaps++

            // Updating new edge buffers and cube state with swapped edges
            eb1 = cubeState[unsolvedEdgeInd]
            eb2 = cubeState[dest_ind2]
            cubeState[unsolvedEdgeInd] = cubeState[EDGE_BUFFER[0]]
            cubeState[dest_ind2] = cubeState[EDGE_BUFFER[1]]
            cubeState[EDGE_BUFFER[0]] = eb1
            cubeState[EDGE_BUFFER[1]] = eb2

            console.log('NEW CUBE STATE')
            for (let i = 0; i < 6; i++) {
                console.log(cubeState.slice(i*9, (i*9)+9))
            }
            console.log('NEW CUBE STATE')
            console.log()
        } else {
            break
        }
    }

    return solution
}

function solveCorners() {
    let solution = ''

    // Solving corners
    let cb1 = cubeState[CORNER_BUFFER[0]]
    let cb2 = cubeState[CORNER_BUFFER[1]]
    let cb3 = cubeState[CORNER_BUFFER[2]]
    while (true) {
        while (cb1 != centers[0] || cb2 != centers[1] || cb3 != centers[4]) {
            if ((cb1 == centers[1] && cb2 == centers[4] && cb3 == centers[0]) || (cb1 == centers[4] && cb2 == centers[0] && cb3 == centers[1])) { // Flipped buffer(find other flipped corner/(s) and fix it)
                console.log('FLIPPED BUFFER')
                break
            }
            console.log('Corner buffer: ')
            console.log(cb1, cb2, cb3) // cb2 is the main buffer and determines the target setup
            
            let dest_f1 = centers.indexOf(cb1)
            let dest_f2 = centers.indexOf(cb2)
            let dest_f3 = centers.indexOf(cb3)
            console.log('Destination faces: ')
            console.log(dest_f1, dest_f2, dest_f3)

            // Finding indexes of each buffer sticker
            let cornerno1 = getCornerNo(dest_f1, dest_f2, dest_f3)
            let dest_ind1 = (dest_f1*9) + CORNER_INDICES[cornerno1]
            let cornerno2 = getCornerNo(dest_f2, dest_f1, dest_f3)
            let dest_ind2 = (dest_f2*9) + CORNER_INDICES[cornerno2]
            let cornerno3 = getCornerNo(dest_f3, dest_f1, dest_f2)
            let dest_ind3 = (dest_f3*9) + CORNER_INDICES[cornerno3]

            let corner_setup_ind = dest_f2*4 + cornerno2 // cb2 is LBU and determines the target
            console.log('Corner setup: ')
            console.log(CORNER_SETUPS[corner_setup_ind])

            solution += CORNER_SETUPS[corner_setup_ind]
            solution += CORNER_SWAP
            solution += reverseSetup(CORNER_SETUPS[corner_setup_ind])

            // Updating cube state to swap edges
            cubeState[CORNER_BUFFER[0]] = cubeState[dest_ind1]
            cubeState[CORNER_BUFFER[1]] = cubeState[dest_ind2]
            cubeState[CORNER_BUFFER[2]] = cubeState[dest_ind3]
            cubeState[dest_ind1] = cb1
            cubeState[dest_ind2] = cb2
            cubeState[dest_ind3] = cb3

            // Updating corner buffers with new colors
            cb1 = cubeState[CORNER_BUFFER[0]]
            cb2 = cubeState[CORNER_BUFFER[1]]
            cb3 = cubeState[CORNER_BUFFER[2]]

            console.log('NEW CUBE STATE')
            for (let i = 0; i < 6; i++) {
                console.log(cubeState.slice(i*9, (i*9)+9))
            }
            console.log('NEW CUBE STATE')
            console.log()
        }
        // Start new cycle if needed
        let unsolvedCornerInd = getUnsolvedCorner()
        if (unsolvedCornerInd !== -1) {
            let f2 = Math.floor(unsolvedCornerInd/9)
            let cornerno2 = CORNER_INDICES.indexOf(Math.floor(unsolvedCornerInd%9))
            let f1
            let f3
            if (cornerno2 == 0) { // Top-left
                f1 = SURROUNDING_FACES[f2][0]
                f3 = SURROUNDING_FACES[f2][1]
            } else if (cornerno2 == 1) { // Top-right
                f1 = SURROUNDING_FACES[f2][0]
                f3 = SURROUNDING_FACES[f2][2]
            } else if (cornerno2 == 2) { // Bottom-left
                f1 = SURROUNDING_FACES[f2][1]
                f3 = SURROUNDING_FACES[f2][3]
            } else if (cornerno2 == 3) { // Bottom-right
                f1 = SURROUNDING_FACES[f2][2]
                f3 = SURROUNDING_FACES[f2][3]
            } else { console.error('Somethings wong again') } // Cannot reach here

            let cornerno1 = getCornerNo(f1, f2, f3)
            let dest_ind1 = (f1*9) + CORNER_INDICES[cornerno1]
            let cornerno3 = getCornerNo(f3, f1, f2)
            let dest_ind3 = (f3*9) + CORNER_INDICES[cornerno3] 
            // dest_ind2 is unsolvedCornerInd

            console.log('Starting new cycle at ')
            console.log(f1, f2, f3)
            console.log(cubeState[dest_ind1], cubeState[unsolvedCornerInd], cubeState[dest_ind3])

            // Swapping to unsolved corner
            let corner_setup_ind = (f2 * 4) + cornerno2
            solution += CORNER_SETUPS[corner_setup_ind]
            solution += CORNER_SWAP
            solution += reverseSetup(CORNER_SETUPS[corner_setup_ind])

            // Updating new corner buffers and cube state with swapped corners
            cb1 = cubeState[dest_ind1]
            cb2 = cubeState[unsolvedCornerInd]
            cb3 = cubeState[dest_ind3]
            cubeState[dest_ind1] = cubeState[CORNER_BUFFER[0]]
            cubeState[unsolvedCornerInd] = cubeState[CORNER_BUFFER[1]]
            cubeState[dest_ind3] = cubeState[CORNER_BUFFER[2]]
            cubeState[CORNER_BUFFER[0]] = cb1
            cubeState[CORNER_BUFFER[1]] = cb2
            cubeState[CORNER_BUFFER[2]] = cb3

            console.log('NEW CUBE STATE')
            for (let i = 0; i < 6; i++) {
                console.log(cubeState.slice(i*9, (i*9)+9))
            }
            console.log('NEW CUBE STATE')
            console.log()
        } else {
            break
        }
    }

    return solution
}

function getUnsolvedEdge() {
    for (let i = 0; i < 6; i++) {
        for (let j = 1; j < 9; j += 2) {
            if ((i == 0 && j == 5) || (i == 3 && j == 1)) continue // Ignore flipped buffer
            if (cubeState[(i*9)+j] != centers[i]) return (i*9)+j
        }
    }
    return -1
}

function getUnsolvedCorner() {
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
            if ((i == 0 && j == 0) || (i == 1 && j == 0) || (i == 4 && j == 1)) continue // Ignore flipped buffer
            if (cubeState[(i*9)+CORNER_INDICES[j]] != centers[i]) return (i*9)+CORNER_INDICES[j]
        }
    }
    return -1
}

function getCornerNo(main_face, f1, f2) {
    // Surrounding faces go top, left, right, bottom
    // Centers of f1 and f2 cannot be top & bottom (0, 3) or left & right(1, 2)
    let surr_ind1 = SURROUNDING_FACES[main_face].indexOf(f1)
    let surr_ind2 = SURROUNDING_FACES[main_face].indexOf(f2)
    if (surr_ind1 + surr_ind2 == 1) { // Top-left corner
        return 0
    } else if (surr_ind1 + surr_ind2 == 2) { // Top-right corner
        return 1
    } else if (surr_ind1 + surr_ind2 == 4) { // Bottom-left corner
        return 2
    } else if (surr_ind1 + surr_ind2 == 5) { // Bottom-right corner
        return 3
    }

    return -1
}

export default function solve(cubestate) {
    let solution = '';

    cubeState = cubestate

    centers.length = 0;
    nswaps = 0;
    for (let i = 0; i < 6; i++) {
        centers.push(cubeState[(i*9) + 4]) // Center is always the 5th on a face
    }
    console.log('CENTERS: ')
    console.log(centers)

    solution += solveEdges()

    // Check for parity
    if (nswaps % 2 != 0) solution += PARITY_ALG

    solution += solveCorners()

    return solution
}
