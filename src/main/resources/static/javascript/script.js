const baseUrl = "/verwaltung/api";

function loadTemplates(file){
    console.log("loadTemplates  "+ file);
    return new Promise((resolve) => {
        $("body").load("/templates/navbar.html", function(){
            let div = document.createElement("div");
            let site = window.localStorage.getItem("siteId");
            let link = document.getElementById(site+"Link");
            link.classList.add("active");
            link.setAttribute("aria-current", "page")
            div.id = "container";
            $(div).load("/templates/"+file, function(){
                document.body.appendChild(div);
                resolve();
            });
        });
    });
}

function init(){
    console.log("init");
    let site = window.localStorage.getItem("siteId");
    if(!site){
        site = "dashboard";
        window.localStorage.setItem("siteId", site);
    }
    if(site == "dashboard"){
        initDashboard();
    }else if(site == "gehalt"){
        initGehalt();
    }else if(site == "verwaltung"){
        initVerwaltung();
    }else if(site == "manager"){
        initManager();
    }else if(site == "schichten"){
        initSchichten();
    }
}

function changeView(site){
    console.log("changeView");
    window.localStorage.setItem("siteId", site);
    window.location.reload();
}

function initManager(){
    loadTemplates("manager.html").then(() => addManagerView());
}

function initSchichten(){
    loadTemplates("arbeiten.html").then(() => createSchichtView());
}

function initDashboard(){
    console.log("initDashboard");
    loadTemplates("dashboard.html").then(() => addArbeiterView().then(() => addGehaltView()));
}

function initVerwaltung(){
    console.log("initVerwaltung");
    loadTemplates("mitarbeiter.html").then(() => {
        let mitarbeiterCard = document.getElementById("mitarbeiter-container");
        getArbeiterView().then((event) => {console.log(event);mitarbeiterCard.append(event);});
    });
    }

function initGehalt(){
    console.log("initGehalt");
    loadTemplates("gehaelter.html").then(() => addGehaltView());
}

async function addGehaltView(){
    console.log("addGehaltView");
    let gehaltsliste = await getGehalt();
    let card = document.createElement("div");
    card.className = "card";
    card.append(createListItem(decodeURI(gehaltsliste)));
    $("#gehalts-container").append(card);
}

function addArbeiterView(){
    console.log("addArbeiterView");
    return new Promise(resolve => {
        getMitarbeiter().then(result => {
            let card = document.createElement("div");
            card.className = "card";
            card.id = "mitarbeiter-card";
            let mitarbeiter = JSON.parse(result);
            if(mitarbeiter != null && mitarbeiter.length > 0){
                mitarbeiter.forEach(function(entry){
                card.append(createListItem(decodeURI(entry.name)));
                });
            }else{
                card.append(createListItem("Es sind noch keine Mitarbeiter in der Abteilung"));
            }
            $("#mitarbeiter-container").append(card)
            resolve("success");
        });
    })
}

function addManagerView(){
    console.log("addManagerView");
    return new Promise(resolve => {
        getManager().then(result => {
            let card = document.createElement("div");
            card.className = "card";
            card.id = "manager-card";
            let manager = JSON.parse(result);
            if(manager != null){
                card.append(createListItem(manager.name));
            }
            $("#manager-container").append(card)
            resolve("success");
        });
    })
}

function createSchichtView(){
    console.log("createSchichtView");
    return new Promise(resolve => {
        getSchichtarbeiter().then(result => {
            let card = document.createElement("div");
            card.className = "card";
            card.id = "schicht-card";
            let schichtarbeiter = JSON.parse(result);
            if(schichtarbeiter != null && schichtarbeiter.length > 0){
                schichtarbeiter.forEach(function(entry){
                card.append(createEditableListItem(entry));
                });
            }else{
                card.append(createListItem("Es sind noch keine Schichtarbeiter in der Abteilung"));
            }
            $("#schicht-container").append(card)
            resolve("success");
        });
    })
}

function getArbeiterView(){
    console.log("getArbeiterView");
    return new Promise(resolve => {
        getMitarbeiter().then(result => {
            let card = document.createElement("div");
            card.className = "card";
            card.id = "mitarbeiter-card";
            let mitarbeiter = JSON.parse(result);
            if(mitarbeiter != null && mitarbeiter.length > 0){
                mitarbeiter.forEach(function(entry){
                card.append(createRemovableListItem(entry));
                });
            }else{
                card.append(createListItem("Es sind noch keine Mitarbeiter in der Abteilung"));
            }
            resolve(card);
        });
    })
}

function changeMitarbeiterView(event){
    console.log("changeMitarbeiterView");
    console.log(event);
    resetForm();
    if(event.target.id == "buero"){
        document.getElementById("addBuero").style.display = "";
        document.getElementById("addSchicht").style.display = "none";
    }else{
        document.getElementById("addBuero").style.display = "none";
        document.getElementById("addSchicht").style.display = "";
    }
}

function resetForm(){
     console.log("resetForm");
    resetBuero();
    resetSchicht();
}

function resetBuero(){
    console.log("resetBuero");
    let inputs = document.querySelectorAll("#addBuero input");
    console.log(inputs);
    inputs.forEach(function(input){
        input.value = "";
        input.innerText = "";
    });
}

function resetSchicht(){
    console.log("resetSchicht");
    let inputs = document.querySelectorAll("#addSchicht input");
    inputs.forEach(function(input){
        input.value = "";
        input.innerText = "";
    });
}

function resetManagerForm(){
    console.log("resetManagerForm");
    let inputs = document.querySelectorAll("#changeManager input");
    inputs.forEach(function(input){
        input.value = "";
        input.innerText = "";
    });
}

async function changeManager(){
    console.log("changeManager");
    let name = document.getElementById("inputName").value;
    let festgehalt = document.getElementById("inputFestgehalt").value;
    let bonusSatz = document.getElementById("inputBonusSatz").value / 100;
    let body = {"id": 2, "name": name, "festgehalt": festgehalt, "bonusSatz": bonusSatz};
    await callChangeManager(body);
    window.location.reload();
}

function callChangeManager(body){
    console.log("callChangeManger");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("POST", baseUrl+ "/changeManager");
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(body));
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

async function addMitarbeiter(){
    console.log("addMitarbeiter");
    let isBueroArbeiter = document.getElementById("buero").checked;
    console.log(isBueroArbeiter);
    if(isBueroArbeiter == true){
        console.log("BueroArbeiter");
        let name = document.getElementById("inputNameB").value;
        let festgehalt = document.getElementById("inputFestgehalt").value;
        let body = {"id": 1, "name": name, "festgehalt": festgehalt};
        console.log(JSON.stringify(body))
        await addBueroArbeiter(body);
        window.location.reload();
    }else{
        console.log("Schichtarbeiter");
        let name = document.getElementById("inputName").value;
        let stundenSatz = document.getElementById("inputStundensatz").value;
        let stunden = document.getElementById("inputStunden").value;
        let body = {"id": 0, "name": name, "stundenSatz": stundenSatz, "anzahlStunden": stunden};
        console.log(JSON.stringify(body))
        await addSchichtArbeiter(body);
        window.location.reload();
    }
}

function addBueroArbeiter(body){
    console.log("addBueroArbeiter");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("POST", baseUrl+ "/addBueroArbeiter");
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(body));
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

function addSchichtArbeiter(body){
    console.log("addSchichtArbeiter");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("POST", baseUrl+ "/addSchichtArbeiter");
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(body));
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

function addVerwaltung(){
    console.log("addVerwaltung");
    let div = document.createElement("div");
    div.className = "d-md-block mx-auto";
    let button = document.createElement("button");
    button.innerText = "+";
    button.className = "btn btn-primary";
    button.type="button";
    button.setAttribute("data-bs-target", "#mitarbeiterDialog");
    button.setAttribute("data-bs-toggle", "modal");
    div.appendChild(button);
    return div;
}

function createListItem(text){
    console.log("createListItem");
    let listItem = document.createElement("li");
    listItem.className = "list-group-item";
    let label =  document.createElement("label");
    label.innerText = text;
    listItem.appendChild(label);
    return listItem;
}

function createRemovableListItem(entry){
    console.log("createRemovableListItem");
    let listItem = document.createElement("li");
    listItem.className = "list-group-item";
    listItem.id = entry.id;
    let div = document.createElement("div");
    div.className = "grid gap-0 column-gap-5";
    let label =  document.createElement("label");
    label.innerText = entry.name;
    label.className = "p-3 g-col-6";
    div.appendChild(label);
    let button = document.createElement("button");
    button.className = "btn btn-primary g-col-6";
    button.style.float = "right";
    button.type="button";
    let span = document.createElement("span");
    span.className = "material-symbols-outlined";
    span.innerHTML = "delete";
    span.style.float = "left";
    span.style.width = "auto";
    button.append(span);
    let buttonLabel = document.createElement("label");
    buttonLabel.innerHTML = "Entfernen";
    button.append(buttonLabel);
    button.setAttribute("data-bs-target", "#mitarbeiterRemoveDialog");
    button.setAttribute("data-bs-toggle", "modal");
    button.setAttribute("data-mitarbeiterId", entry.id);
    button.addEventListener("click", function(event){
        let container = document.getElementById("removeMitarbeiter");
        container.innerHTML ="";
        container.append(createListItem(entry.name));
        window.localStorage.setItem("removeMitarbeiter", JSON.stringify(entry));
        console.log(event);
    });
    div.appendChild(button);
    listItem.appendChild(div);
    return listItem;
}

function createEditableListItem(entry){
    console.log("createEditableListItem");
    let listItem = document.createElement("li");
    listItem.className = "list-group-item";
    listItem.id = entry.id;
    let div = document.createElement("div");
    div.className = "grid gap-0 column-gap-5";
    let label =  document.createElement("label");
    label.innerText = entry.name;
    label.className = "p-3 g-col-6";
    div.appendChild(label);
    let button = document.createElement("button");
    button.className = "btn btn-primary g-col-6";
    button.style.float = "right";
    button.type="button";
    let span = document.createElement("span");
    span.className = "material-symbols-outlined";
    span.innerHTML = "edit";
    span.style.float = "left";
    span.style.width = "auto";
    button.append(span);
    let buttonLabel = document.createElement("label");
    buttonLabel.innerHTML = "Eintragen";
    button.append(buttonLabel);
    button.setAttribute("data-bs-target", "#schichtDialog");
    button.setAttribute("data-bs-toggle", "modal");
    button.setAttribute("data-arbeiterId", entry.id);
    button.setAttribute("data-arbeiterName", entry.name);
    button.addEventListener("click", function(event){
        let container = document.getElementById("nameLabel");
        container.innerHTML = entry.name;
        window.localStorage.setItem("schichtArbeiter", JSON.stringify(entry));
        console.log(event);
    });
    div.appendChild(button);
    listItem.appendChild(div);
    return listItem;
}

async function addSchicht(){
    console.log("addSchicht");
    let schichtArbeiter = JSON.parse(window.localStorage.getItem("schichtArbeiter"));
    let anzahlStunden = document.getElementById("inputAnzahlStunden").value;
    await callAddSchicht(schichtArbeiter.id, anzahlStunden);
    window.location.reload();
}

async function removeMitarbeiter(){
    console.log("removeMitarbeiter");
    let mitarbeiter = JSON.parse(window.localStorage.getItem("removeMitarbeiter"));
    await removeMitarbeiterCall(mitarbeiter.id);
    window.localStorage.removeItem("removeMitarbeiter");
    window.location.reload();
}

function removeMitarbeiterCall(id){
    console.log("removeMitarbeiterCall");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("DELETE", baseUrl+ "/delete/mitarbeiter/"+id,);
        request.send();
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

function callAddSchicht(id, stunden){
    console.log("removeMitarbeiterCall");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("POST", baseUrl+ "/schicht/mitarbeiter/"+id+"/"+stunden);
        request.send();
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

function getMitarbeiter(){
    console.log("getMitarbeiter");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("GET", baseUrl+ "/mitarbeiter",);
        request.send();
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

function getSchichtarbeiter(){
    console.log("getSchichtarbeiter");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("GET", baseUrl+ "/schichtarbeiter",);
        request.send();
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

function getGehalt(){
    console.log("getGehalt");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("GET", baseUrl+ "/gehaltsliste",);
        request.send();
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

function getManager(){
    console.log("getManager");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("GET", baseUrl+ "/manager",);
        request.send();
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}

function getAbteilungName(){
    console.log("getAbteilungName");
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open("GET", baseUrl+ "/abteilungName",);
        request.send();
        request.onload = function(result){
            console.log(result.target.response);
            resolve(result.target.response);
        }
    })
}
