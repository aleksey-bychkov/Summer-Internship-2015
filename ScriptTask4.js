// root namespace
var Eastbanc = Eastbanc || {};

// sub namespace
Eastbanc.Internship = Eastbanc.Internship || {};

// class
Eastbanc.Internship.Task4 = function(origin)
{
    var that = this;
    that.center = origin;
    that.map = new google.maps.Map(document.getElementById('map-canvas'),
    {
        center: that.center,
        zoom: 15
    });

    function makePage()
    {
        var markers = [];

        //makes and initializes map
        that.map.fitBounds(that.map.getBounds());

        //makes and places the seacrh box
        var input =(document.getElementById('pac-input'));
        that.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        var searchBox = new google.maps.places.SearchBox((input));

        //action listner for the serchbox
        google.maps.event.addListener(searchBox, 'places_changed', function searchFunction()
        {
            //gets an array of all places
            var places = searchBox.getPlaces();

            if (places.length == 0)
                return;

            //clears all markers from map
            for (var i = 0, marker; marker = markers[i]; i++) {
                marker.setMap(null);
            }
            markers = [];

            var window;

            //places 10 markers
            for (var i =0; i<10; i++)
            {
                (function placeMarkers()
                {
                    var index=i;
                    var marker = new google.maps.Marker
                    (
                        {
                            map: that.map,
                            title: places[i].name,
                            position: places[i].geometry.location
                        }
                    );


                    google.maps.event.addListener(marker, 'click', function makeWIndows()
                    {
                        //closes window if one exists
                        if (window)
                            window.close();

                        //makes and opens a new window for the current marker
                        window = new google.maps.InfoWindow
                        (
                            {
                                content: info = '<div id="content">' +
                                    '<div id="siteNotice">' +
                                    '</div>' +
                                    '<h1 id="firstHeading" class="firstHeading"></h1>' +
                                    '<div id="bodyContent">' +
                                    '<form name="find-Route">' +
                                    'Address from:  <input type="text" name="Address" size="55" id="address' + index.toString() + '" value="1211 31st St NW, Washington, DC 20007"/>' +
                                    '<input type="button" value="Find route to this point" id="findRoute' + index.toString() + '" />' +
                                    '</form>' +
                                    '</div>' +
                                    '</div>'
                            }
                        );

                        window.open(that.map, marker);

                        //displays route when the button in the window is clicked
                        document.getElementById("findRoute" + index.toString()).onclick = function calculateRoute()
                        {
                            //returns the paramater as a latlng object
                            function addressToLatlng(address)
                            {
                                var latlng = new google.maps.LatLng();
                                var geocoder = new google.maps.Geocoder();

                                geocoder.geocode( address, function(results, status)
                                {
                                    if (status == google.maps.GeocoderStatus.OK)
                                    {
                                        latlng.lat.value = results[0].geometry.location.lat();
                                        latlng.lng.value = results[0].geometry.location.lng();


                                    } else {
                                        alert('Geocode was not successful for the following reason: ' + status);
                                    }
                                });

                                return latlng;
                            }

                            //finda and displays a route from start to end (both latlng objects)
                            function FindRoute(start, end)
                            {
                                geocoder = new google.maps.Geocoder();

                                var request =
                                {
                                    origin: start,
                                    destination: end,
                                    travelMode: google.maps.TravelMode.DRIVING
                                };

                                directionsService.route(request, function(response, status)
                                {
                                    if (status == google.maps.DirectionsStatus.OK)
                                    {
                                        directionsDisplay.setDirections(response);
                                    }
                                });
                            }

                            var geocoder = new google.maps.Geocoder();

                            FindRoute(document.getElementById("address" + index).value, marker.position);
                        };

                    });

                    markers.push(marker);
                })();
            }

        });

        //makes sure the seachbar can work
        google.maps.event.addListener(that.map, 'bounds_changed', function changeBounds()
        {
            searchBox.setBounds(that.map.getBounds());
        });

        //initialzes the side panel
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setPanel(document.getElementById('directions-panel'));
        directionsDisplay.setMap(that.map);


    };

    // constructor
    return {
        makePage: makePage()
    };
};