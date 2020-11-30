function start() {
    console.log(document.getElementById("name").value)
    console.log(document.getElementById("room").value)

    //var NAME = document.getElementById("name").value

    let script = document.createElement("script")
    script.type = "application/javascript"
    script.src = "scripts/sketch.js"
    document.getElementById("sketch_container").appendChild(script)
}


