/**
 * Created by aleks_000 on 6/23/2015.
 */

//places all the allMarkers for all the buses for the past time where time is the number of hours
function placeAll()
{
    clearMap();
    allMarkers = [];
    var endDate = new Date("Mon Jun 22 2015 15:00:00 GMT-0400 (Eastern Daylight Time)");
    var startDate = new Date(endDate.getTime() - (3 * 60 * 60 * 1000));
    var bounds = new google.maps.LatLngBounds(null);
    var interval = 15 * 60 * 1000;
    var numIntervals = (endDate.getTime() - startDate.getTime())/interval;
    var currentInterval = 1;

    url.fromUTC = startDate;
    url.toUTC = new Date(startDate.getTime() + (interval));

    for(var x = 0; x < buses.length; x++)
    {
        (function()
        {
            currentInterval = 1;
            url.vehicleId = buses[x];
            place(interval);
        })();
    }

    show();

    function place(interval)
    {
        if(url.toUTC.getTime() <= endDate.getTime())
        {
            $.ajax(
                {
                    url: url.markerURL(),
                    jsonp: "callback",
                    dataType: "jsonp",
                    success: function(info)
                    {
                        doMarkers(info, (25 * currentInterval)/numIntervals);

                        map.fitBounds(new google.maps.LatLngBounds(null));
                        map.fitBounds(bounds);
                        currentInterval++;

                        url.fromUTC = url.toUTC;
                        url.toUTC = new Date(url.fromUTC.getTime() + interval);

                        place(interval);
                    },
                    error: function ()
                    {
                        alert("Failed to retrieve info!");
                    }
                });
        }

        function doMarkers(information, size)
        {

            var infoWindow;
            var latlng;

            for(var index = 0; index < information.length; index++)
            {
                (function makeMarkers()
                {
                    var current = information[index];
                    var markerImage = transitIQImage;

                    latlng = new google.maps.LatLng(current.Lat, current.Lon);

                    bounds.extend(latlng);

                    var mSize = ((index * size)/information.length) + 10;

                    if(current.DeviceId == null)
                        markerImage= nextBusImage;

                    var image = {
                        url: markerImage,
                        size: new google.maps.Size(mSize, mSize),
                        origin: new google.maps.Point(mSize/2,mSize/2)
                    };

                    //makes the allMarkers
                    var marker = new google.maps.Marker
                    (
                        {
                            map: map,
                            icon: image,
                            title: allMarkers.length+"",
                            position: latlng,
                            visible: true
                        }
                    );

                    //makes the info window
                    var time = current.ReportDateUtc;
                    time = time.substring(time.indexOf("(")+1, time.indexOf(")"));
                    time = new Date(parseInt(time));

                    var content = '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<h1 id="firstHeading" class="firstHeading"></h1>' +
                        '<div id="bodyContent">' +
                        '<table>' +
                        '<tr>' +
                        '<th>Agency Id</th><td>' + current.AgencyId + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Device Id</th><td>' + current.DeviceId + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Is Standing</th><td>' + current.IsStanding + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Location</th><td>' + latlng.toString() + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Vehicle Id</th><td>' + current.VehicleId + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Time</th><td>' + time + '</td>' +
                        '</tr>' +
                        '</table>' +
                        '</div>' +
                        '</div>';

                    google.maps.event.addListener(marker, 'click', function makeWindows()
                    {
                        //closes infoWindow if one exists
                        if (infoWindow)
                            infoWindow.close();

                        //makes and opens a new infoWindow for the current marker
                        infoWindow = new google.maps.InfoWindow
                        (
                            {
                                content: content
                            }
                        );

                        //binds the infoWindow to the marker&map
                        infoWindow.open(map, marker);
                    });

                    //adds the allMarkers
                    allMarkers.push(marker);
                })();
            }
        }
    }


}




//public method that places markers on the map using the information it has
function placeMarkers()
{
    //makes an array of markers and a bounds objeect
    var markers = [];
    var bounds = new google.maps.LatLngBounds(null);

    //grabs the information from the server
    $.ajax(
        {
            url: url.markerURL(),
            jsonp: "callback",
            dataType: "jsonp",
            success: function(data)
            {
                //if it recives actual data places markers from that data
                if(data.length >= 1)
                    placeInformation(data, 30);
            },
            error: function ()
            {
                alert("Failed to retrieve info!");
            }
        });

    //returns all the markers it added along with the bounds of those markers
    return {
        markers: markers,
        bounds: bounds
    };

    //takes in an array of JSON objects and adds makers on a map based off of the array
    //along with the size of the markers
    function placeInformation(information, size)
    {
        var infoWindow;
        var latlng;

        //iterates through the array of information
        for(var index = information.length-1; index >= 0; index--)
        {
            (function makeMarkers()
            {

                //makes a local variable of data that is being used
                var current = information[index];

                //sets the apropreate image for the marker
                var markerImage = transitIQImage;
                if(current.DeviceId == null)
                    markerImage= nextBusImage;

                //grabs the location for the marker from current and adds it to the bounds of the map
                latlng = new google.maps.LatLng(current.Lat, current.Lon);
                bounds.extend(latlng);

                //calculates the size diffrence between every data point
                var mSize = ((index * size)/information.length) + 10;

                //makes the marker image with the size and sets the origin on the center of the image
                var image = {
                    url: markerImage,
                    size: new google.maps.Size(mSize, mSize),
                    origin: new google.maps.Point(mSize/2,mSize/2)
                };

                //makes the marker
                var marker = new google.maps.Marker
                (
                    {
                        map: map,
                        icon: image,
                        title: allMarkers.length+"",
                        position: latlng,
                        visible: false
                    }
                );

                //makes the info window
                var time = current.ReportDateUtc;
                time = time.substring(time.indexOf("(")+1, time.indexOf(")"));
                time = new Date(parseInt(time));

                var content = '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h1 id="firstHeading" class="firstHeading"></h1>' +
                    '<div id="bodyContent">' +
                    '<table>' +
                    '<tr>' +
                    '<th>Agency Id</th><td>' + current.AgencyId + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<th>Device Id</th><td>' + current.DeviceId + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<th>Is Standing</th><td>' + current.IsStanding + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<th>Location</th><td>' + latlng.toString() + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<th>Vehicle Id</th><td>' + current.VehicleId + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<th>Time</th><td>' + time + '</td>' +
                    '</tr>' +
                    '</table>' +
                    '</div>' +
                    '</div>';

                //makes the infoWindow operatable
                google.maps.event.addListener(marker, 'click', function makeWindows()
                {
                    //closes infoWindow if one exists
                    if (infoWindow)
                        infoWindow.close();

                    //makes and opens a new infoWindow for the current marker
                    infoWindow = new google.maps.InfoWindow
                    (
                        {
                            content: content
                        }
                    );

                    //binds the infoWindow to the marker & the map
                    infoWindow.open(map, marker);
                });

                //adds the markers to the total markers on the map and the array of markers added
                markers.push(marker);
                allMarkers.push(marker);
            })();
        }
    }
}


