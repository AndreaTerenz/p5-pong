function joinRoom() {
    sketch_connect("join")
}

function createRoom() {
    sketch_connect("create")
}

function resetInputs () {
    document.getElementById("name").value = ""
    document.getElementById("room").value = ""
}

function sketch_connect(mode) {
    let name = document.getElementById("name").value
    let room = document.getElementById("room").value

    if (name && room) {
        connect(name, room, mode)
    }
}

