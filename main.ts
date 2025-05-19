let tablero = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
];

let piezas = [
    [[1, 1, 1], [0, 1, 0]],  // Forma en T
    [[1, 1], [1, 1]],        // Cuadrado
    [[1, 1, 0], [0, 1, 1]],  // Forma en Z
    [[0, 1, 1], [1, 1, 0]],  // Forma en S
    [[1, 0, 0], [1, 1, 1]]   // Forma en L
];

let piezaActual = piezas[Math.floor(Math.random() * piezas.length)];
let x = 2, y = 0;
let puntaje = 0;
let nivel = 1;
let tiempoCaida = 1000;  // Tiempo inicial para la caída de las piezas (más despacio)

function mostrarTablero() {
    basic.clearScreen();
    for (let fila = 0; fila < 5; fila++) {
        for (let col = 0; col < 5; col++) {
            if (tablero[fila][col] === 1) {
                led.plot(col, fila);
            }
        }
    }
    mostrarPieza();
}

function mostrarPieza() {
    for (let fila = 0; fila < piezaActual.length; fila++) {
        for (let col = 0; col < piezaActual[fila].length; col++) {
            if (piezaActual[fila][col] === 1) {
                led.plot(x + col, y + fila);
            }
        }
    }
}

function borrarPieza() {
    for (let fila = 0; fila < piezaActual.length; fila++) {
        for (let col = 0; col < piezaActual[fila].length; col++) {
            if (piezaActual[fila][col] === 1) {
                led.unplot(x + col, y + fila);
            }
        }
    }
}

function fijarPieza() {
    for (let fila = 0; fila < piezaActual.length; fila++) {
        for (let col = 0; col < piezaActual[fila].length; col++) {
            if (piezaActual[fila][col] === 1) {
                tablero[y + fila][x + col] = 1;
            }
        }
    }
}

function eliminarFilas() {
    for (let fila = 4; fila >= 0; fila--) {
        if (tablero[fila].every(celda => celda === 1)) {
            puntaje += 100;
            for (let i = fila; i > 0; i--) {
                tablero[i] = tablero[i - 1].slice();
            }
            tablero[0] = [0, 0, 0, 0, 0];
            mostrarPuntaje();
        }
    }
}

function mostrarPuntaje() {
    basic.clearScreen();
    basic.showNumber(puntaje);
}

function verificarEspacioParaNuevaPieza() {
    for (let fila = 0; fila < piezaActual.length; fila++) {
        for (let col = 0; col < piezaActual[fila].length; col++) {
            if (piezaActual[fila][col] === 1) {
                // Si la pieza va más allá del límite superior o choca con una pieza fija
                if (tablero[y + fila][x + col] === 1) {
                    return false; // Si no hay espacio, retornar false
                }
            }
        }
    }
    return true; // Si hay espacio, retornar true
}

function generarNuevaPieza() {
    piezaActual = piezas[Math.floor(Math.random() * piezas.length)];
    x = 2;
    y = 0;

    // Verificar si la nueva pieza puede caer
    if (!verificarEspacioParaNuevaPieza()) {
        // Si no hay espacio, simplemente no generamos una nueva pieza
        return;
    }
}

function piezaPuedeCaer() {
    for (let fila = 0; fila < piezaActual.length; fila++) {
        for (let col = 0; col < piezaActual[fila].length; col++) {
            if (piezaActual[fila][col] === 1) {
                if (y + fila + 1 >= 5 || tablero[y + fila + 1][x + col] === 1) {
                    return false;
                }
            }
        }
    }
    return true;
}

function moverPiezaAbajo() {
    borrarPieza();
    if (piezaPuedeCaer()) {
        y += 1;
    } else {
        fijarPieza();
        eliminarFilas();
        generarNuevaPieza();  // Intentar generar una nueva pieza
    }
    mostrarTablero();
}

function rotarPieza() {
    let piezaRotada: number[][] = [];

    // Rotar la pieza 90 grados en el sentido de las agujas del reloj
    for (let col = 0; col < piezaActual[0].length; col++) {
        let nuevaFila: number[] = [];
        for (let fila = piezaActual.length - 1; fila >= 0; fila--) {
            nuevaFila.push(piezaActual[fila][col]);
        }
        piezaRotada.push(nuevaFila);
    }

    // Verificar si la rotación es válida
    if (comprobarEspacio(piezaRotada)) {
        piezaActual = piezaRotada;  // Si la rotación es válida, aplicar la nueva pieza rotada
    }

    mostrarTablero();  // Actualizar la pantalla después de la rotación
}

function comprobarEspacio(piezaRotada: number[][]): boolean {
    for (let fila = 0; fila < piezaRotada.length; fila++) {
        for (let col = 0; col < piezaRotada[fila].length; col++) {
            if (piezaRotada[fila][col] === 1) {
                // Comprobar si el bloque de la pieza rotada se sale del tablero o choca con otras piezas
                if (x + col < 0 || x + col >= 5 || y + fila >= 5 || tablero[y + fila][x + col] === 1) {
                    return false; // Si hay colisión, no se puede rotar
                }
            }
        }
    }
    return true; // Si no hay colisión, se puede rotar
}

input.onButtonPressed(Button.A, function () {
    // Mover la pieza de izquierda a derecha
    borrarPieza();
    if (x > 0) {
        x -= 1;  // Mover a la izquierda
    }
    mostrarTablero();
});

input.onButtonPressed(Button.B, function () {
    rotarPieza();  // El botón B rota la pieza
});

basic.forever(function () {
    moverPiezaAbajo();  // Continuar moviendo la pieza hacia abajo
    basic.pause(tiempoCaida);  // Esperar un poco más entre cada caída de pieza
});



