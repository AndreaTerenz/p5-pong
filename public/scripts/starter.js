function start() {
    var NAME = prompt("Insert username", "")

    let container = document.getElementById("sketch_container")
    let script = document.createElement("script")
    script.src = "./scripts/sketch.js"
    container.appendChild(script)
}


