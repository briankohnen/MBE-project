var firebaseConfig = {
    apiKey: "AIzaSyB_bxWCVNUZm5LDTyco5NaqqzqJBxC0VHM",
    authDomain: "mbe-projec.firebaseapp.com",
    databaseURL: "https://mbe-projec.firebaseio.com",
    projectId: "mbe-projec",
    storageBucket: "",
    messagingSenderId: "257536059910",
    appId: "1:257536059910:web:2757f6b32210a138"
  };

firebase.initializeApp(firebaseConfig);
var database = firebase.database();


var myLat = 0;
var myLong = 0;


var map;
var mapDefaultZoom = 12;



function initialize_map(lat, long) {
        map = new ol.Map({
        target: "map",
        layers: [
            new ol.layer.Tile({
            source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([long, lat]),
            zoom: mapDefaultZoom
        })
    })
    var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([parseFloat(long), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857')),
            })]
        }),
        style: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                src: "https://upload.wikimedia.org/wikipedia/commons/5/50/Small_blue_dot.png"
            })
        })
    });

    map.addLayer(vectorLayer);
    console.log(map.getView().getCenter());
}



function changeMapView(lat, long) {
    map.getView().setCenter(ol.proj.transform([parseFloat(long), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(16);
    }



function add_map_point(lat, lng) {
   
    var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([parseFloat(lng), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857')),
            })]
        }),
        style: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                src: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg"
            })
        })
    });

    map.addLayer(vectorLayer);
}



navigator.geolocation.getCurrentPosition(function(position) {
    myLat = position.coords.latitude;
    myLong = position.coords.longitude;

    initialize_map(myLat, myLong);
}, function(error) {
    if (error.code == error.PERMISSION_DENIED) {
        initialize_map(41.895886, -87.62003)
    }
});



    $("#submitButton").on("click", function() {

        var userCityInp;
        var userKeyWord;

        event.preventDefault();

        userCityInp = $("#userCityInp").val().trim();
        userKeyWord = $("#userKeyWord").val().trim();

        var queryURL =
        //"https://app.ticketmaster.com/discovery/v2/events.json?keyword=" + userKeyWord + "&apikey=7elxdku9GGG5k8j0Xm8KWdANDgecHMV0&latlong=" + myLat + myLong + "&radius=10&units=miles";
        "https://app.ticketmaster.com/discovery/v2/events.json?keyword=" + userKeyWord + "&city=" + userCityInp + "&apikey=7elxdku9GGG5k8j0Xm8KWdANDgecHMV0&radius=10&units=miles";


        $.ajax({

        url: queryURL,    

        method: "GET"

        }).then(function(response) {

            $("#eventsList").empty();

            var results = response._embedded.events;
            console.log(results);

            for (var i = 0; i < results.length; i++) {

            var eventName = results[i].name;
            var eventLocation = results[i]._embedded.venues[0].name;
            var eventCoords = [results[i]._embedded.venues[0].location.longitude, results[i]._embedded.venues[0].location.latitude];
            var eventDate = results[i].dates.start.localDate;
            var eventTime = results[i].dates.start.localTime;
            var eventLink = results[i].url;
            var eventImg = results[i].images[2].url;

            var linkForUser = $("<a>Click here to buy tickets</a>");
            linkForUser.attr("href", eventLink);

            var eventLI = $("<li>");
            eventLI.attr("class", "eventNearMe");
            eventLI.attr("data-long", eventCoords[0]);
            eventLI.attr("data-lat", eventCoords[1]);

            var eventChatButton = $("<button>See what other users are saying</button>");
            eventChatButton.attr("class", "openChat");
            eventChatButton.attr("data-attr", eventName);
            eventChatButton.attr("data-img", eventImg);

            eventLI.append(eventName, "<br>", eventLocation, "<br>", eventDate, "<br>", eventTime, "<br>", linkForUser , " " , eventChatButton);

            $("#eventsList").append(eventLI);

            add_map_point(eventCoords[1], eventCoords[0]);

            }     

        });

    });



    $(document).on("click", ".eventNearMe", function () {
        var grabEventLong = $(this).attr("data-long");

        var grabEventLat = $(this).attr("data-lat");

        changeMapView(grabEventLat, grabEventLong);
    });

    $(document).on("click", ".openChat", function() {

        $("#chatContent").empty();

        var grabEventName = $(this).attr("data-attr");

        var grabEventDisplay = $(this).attr("data-img");

        var eventNameArray = grabEventName.split("");

        for (var i = 0; i < eventNameArray.length; i++) {
            if (eventNameArray[i] == " " || eventNameArray[i] == "$" || eventNameArray[i] == ".") {
                eventNameArray.splice(i, 1);
            }
            var cleanEventName = eventNameArray.join("");
        }

        //console.log(cleanEventName);

        var modalTitle = $(this).attr("data-attr");

        var modal = document.getElementById("chatModal");

        var span = document.getElementsByClassName("close")[0];

        var chatContent = document.getElementById("chatContent");

        var userChatInput = document.getElementById("userChatInput");

        var submitChat = document.getElementById("submitChat");

        $("#modalTitle").text(modalTitle);

        $("#eventDisplay").attr("src", grabEventDisplay);

        modal.style.display = "block";

        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        database.ref("messaging" + cleanEventName).on("child_added", function(snapshot) {

            var snap = snapshot.val();
            var textUser = snap.user;
            var textVal = snap.text;
            var textTime = moment(snap.time).format("LT");

            var newMessage = $("<p>");

            newMessage.text(textUser + " : " + textVal + " @ " + textTime);

            $(chatContent).prepend(newMessage);

        })

        submitChat.onclick = function(event) {
            event.preventDefault();
            if ($(userChatInput).val().trim() != "") {

                var banter = userChatInput.value;

                var username = sessionStorage.getItem("username");
    
                var newBanter = {
                    user: username,
                    text: banter,
                    time: firebase.database.ServerValue.TIMESTAMP
                };
    
                database.ref("messaging" + cleanEventName).push(newBanter);
            
                userChatInput.value = "";
            }
        }
    });


    
    if (sessionStorage.getItem("username") == null) {

        var modal = document.getElementById("loginModal");

        var span = document.getElementsByClassName("close")[0];

        var userNameInput = document.getElementById("userNameInput");

        var login = document.getElementById("login");
        
        //var newUserInput = document.getElementById("newUserInput");

        //var signup = document.getElementById("signup");

        modal.style.display = "block";

        span.onclick = function() {
            modal.style.display ="none"
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

            login.onclick = function(event) {

                event.preventDefault();

                var newName = userNameInput.value;

                if (newName.trim() != "" && newName.trim().length < 13) {
                    
                    var newUser = {
                        username : newName
                    };

                    database.ref("users").push(newUser);

                    sessionStorage.setItem("username", newName);

                    modal.style.display = "none";

                } else {

                    $("#nameTakenText").text("Username cannot be blank, and no longer than 12 characters.");

                }

            }
    };