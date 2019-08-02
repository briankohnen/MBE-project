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
    console.log(myLat, myLong);
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
            console.log(response);

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
            var linkForUser = $("<a>Click here to buy tickets</a>");
            linkForUser.attr("href", eventLink);

            var eventLI = $("<li>");
            eventLI.attr("class", "eventNearMe");
            eventLI.attr("data-attr", eventName);
            eventLI.append(eventName, "<br>", eventLocation, "<br>", eventDate, "<br>", eventTime, "<br>", linkForUser);

            $("#eventsList").append(eventLI);

            add_map_point(eventCoords[1], eventCoords[0]);

            }
            

        });

    });


    $(document).on("click", ".eventNearMe", function () {

        var newChatRoom = $(this).attr("data-attr");

        var trimmedChatName = newChatRoom.replace(".", "").trim();

        var modal = document.getElementById("chatModal");

        var span = document.getElementsByClassName("close")[0];

        var chatBox = document.getElementById("chatContent");

        var userChatInput = document.getElementById("userChatInput");

        var submitChat = document.getElementById("submitChat");

        // When the user clicks the button, open the modal 
        modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
        modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        }

        database.ref("messaging" + trimmedChatName).on("child_added", function(snapshot) {

            var snap = snapshot.val();
            //var textUser = snap.user;
            var textVal = snap.text;
            var textTime = moment(snap.time).format("LT");

            var newMessage = $("<p>");

            newMessage.text(textVal + "@" + textTime);

            $(chatBox).prepend(newMessage);
        })

        submitChat.onclick = function() {
            if (userChatInput != "") {

                var banter = userChatInput.value;

                //var username = sessionStorage.getItem("username");
    
                var newBanter = {
                    //user: username,
                    text: banter,
                    time: firebase.database.ServerValue.TIMESTAMP
                };
    
                database.ref("messaging" + trimmedChatName).push(newBanter);
            
                userChatInput.value = "";
            }
        }
    });

    // function openChatRoom(roomToEnter) {
    
    //         if ($("#userChatInput").val().trim() !== "") {
    
    //             var banter = $("#userChatInput").val().trim();
    
    //             var username = sessionStorage.getItem("username");
    
    //             var newBanter = {
    //                 user: username,
    //                 text: banter,
    //                 time: firebase.database.ServerValue.TIMESTAMP
    //             };
    
    //             database.ref("messaging" + trimmedChatName).push(newBanter);
    
    //             var inputField = document.getElementById("inpForm");
    //             inputField.reset();
    //         }
    
    
    //     database.ref("messaging").on("child_added", function(snapshot) {
            
    //         var snap = snapshot.val();
    //         var textUser = snap.user;
    //         var textVal = snap.text;
    //         var textTime = moment(snap.time).format("LT");
    
    //         var newMessage = $("<p>");
    
    //         newMessage.text(textUser + " @ " + textTime + " : " + textVal);
    
    //         $(".messages").prepend(newMessage);
            
    //     });
    // }
