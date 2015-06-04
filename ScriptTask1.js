var directionsDisplay;
var geocoder;
var directionsService = new google.maps.DirectionsService();

function initialize()
{
    directionsDisplay = new google.maps.DirectionsRenderer();
    var ebtLoc = new google.maps.LatLng(38.9055751, -77.0611825);
    var homeLoc = new google.maps.LatLng(39.054934, -77.191202);

    var mapOptions =
    {
        center: ebtLoc,
        zoom: 11
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    directionsDisplay.setPanel(document.getElementById('directions-panel'));


    calcRoute(ebtLoc, homeLoc);


    var ebtMarker = new google.maps.Marker
    (
        {
            position: ebtLoc,
            map: map,
            title: 'EastBanc Technologies'
        }
    );

    var homeMarker = new google.maps.Marker
    (
        {
            position: homeLoc,
            map: map,
            title: 'Home'
        }
    );

    var ebtInfo = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading"></h1>'+
        '<div id="bodyContent">'+
        '<img src="image1.png">'+
        '<p> A small technologies company located at 1211 31st St NW, Washington, DC 20007</p>'+
        '<p>More information at: <a href="http://www.eastbanctech.com/">'+
        'http://www.eastbanctech.com/</a></p>'+
        '</div>'+
        '</div>';

    var homeInfo = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading"></h1>'+
        '<div id="bodyContent">'+
        '<img src="image2.png">'+
        '<p> The Bychkov family resides here at 12131 Trailridge Dr, Potomac, MD 20854 </p>'+
        '</div>'+
        '</div>';

    var ebtwindow = new google.maps.InfoWindow
    (
        {
            content: ebtInfo
        }
    );

    var homewindow = new google.maps.InfoWindow
    (
        {
            content: homeInfo
        }
    );

    google.maps.event.addListener(ebtMarker, 'click', function()
    {
        ebtwindow.open(map,ebtMarker);
        homewindow.close();
    });

    google.maps.event.addListener(homeMarker, 'click', function()
    {
        homewindow.open(map,homeMarker);
        ebtwindow.close();
    });

    directionsDisplay.setMap(map);

}

function calcRoute(start, end)
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

function calc()
{//new google.maps.LatLng(parseInt(document.getElementById("lat")), parseInt(document.getElementById("long")));
    var address = document.getElementById("address");
    var latlng =
    {
      lat: document.getElementById("lat"),
      lng: document.getElementById("long")
    };



    if(address.value)
    {
        geocoder.geocode( { 'address': address.value}, function(results, status)
        {
            if (status == google.maps.GeocoderStatus.OK)
            {
                latlng.lat.value = results[0].geometry.location.lat();
                latlng.lng.value = results[0].geometry.location.lng();


            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
    else
    {
        var latlng2= new google.maps.LatLng(latlng.lat.value, latlng.lng.value);

        geocoder.geocode({'latLng': latlng2}, function(results, status)
        {
            if (status == google.maps.GeocoderStatus.OK)
            {
                if (results[1])
                {
                    address.value = results[1].formatted_address;

                } else
                    alert('No results found');
            } else
                alert('Geocoder failed due to: ' + status);

        });
    }
}

google.maps.event.addDomListener(window, 'load', initialize);
