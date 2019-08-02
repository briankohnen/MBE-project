var firebaseConfig = {
    apiKey: "AIzaSyBHDizJfcjb7mmYH__vIWJuo8yJOCdxv1c",
    authDomain: "classproject-7a85e.firebaseapp.com",
    databaseURL: "https://classproject-7a85e.firebaseio.com",
    projectId: "classproject-7a85e",
    storageBucket: "",
    messagingSenderId: "475847005166",
    appId: "1:475847005166:web:72aefa2a4099570b"
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

        var queryURL = //"https://app.ticketmaster.com/discovery/v2/events.json?keyword=music&postalCode=60640&apikey=7elxdku9GGG5k8j0Xm8KWdANDgecHMV0"
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

        console.log($(this).attr("data-attr"));

        database.ref("messaging" + newChatRoom).push();

    });
