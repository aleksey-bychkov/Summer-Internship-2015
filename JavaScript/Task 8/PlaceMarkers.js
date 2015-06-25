
/*

 */
function placeMarkers(pmap, pvehicleId, ptoUTC, pfromUTC, transitIQImage, nextBusImage)
{

    var url =
    {
        markers: "http://transitiqdatareceiver.cloudapp.net/DataReceiver.svc/GetRawCoords",
        vehicleId: pvehicleId,
        key: "DcCi",
        toUTC: ptoUTC,
        fromUTC: pfromUTC,
        toString: function toString()
        {
            return this.markers + "?vehicleId=" + this.vehicleId + "&key=" + this.key + "&toUtc=" + (this.toUTC.toJSON()).substr(0,19) + "&fromUtc=" + (this.fromUTC.toJSON()).substr(0,19) + "&format=json";
        }
    };

    $.ajax(
        {
            url: url.toString(),
            jsonp: "callback",
            dataType: "jsonp",
            success: function(data)
            {
                if(data.length >= 1)
                    place(data);
                else
                {
                    alert("Data was empty");
                }

            },
            error: function ()
            {
                alert("Failed to retrieve info!");
            }
        });

    //takes in an array of JSON objects and adds makers on a map based off of the array
    function place(information)
    {
        var markers = [];
        pmap.fitBounds(new google.maps.LatLngBounds(null));

        var infoWindow;
        var size = 30;
        var bounds = new google.maps.LatLngBounds(null);
        var latlng;

        for(var index = information.length-1; index >= 0; index--)
        {
            (function makeMarkers()
            {
                var current = information[index];
                var markerImage = transitIQImage;

                latlng = new google.maps.LatLng(current.Lat, current.Lon);

                bounds.extend(latlng);

                var mSize = (index * size)/information.length;

                if(current.DeviceId == null)
                    markerImage= nextBusImage;

                var image = {
                    url: markerImage,
                    // This marker is 20 pixels wide by 32 pixels tall.
                    size: new google.maps.Size(mSize, mSize),
                    // The origin for this image is 0,0.
                    origin: new google.maps.Point(mSize/2,mSize/2)
                };

                //makes the markers
                var marker = new google.maps.Marker
                (
                    {
                        map: pmap,
                        icon: image,
                        title: index+"",
                        position: latlng
                    }
                );

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

                    //binds the infoWindow to the marker&pmap
                    infoWindow.open(pmap, marker);
                });

                //adds the markers
                markers.push(marker);
            })();
        }

        pmap.fitBounds(bounds);
    }
}

/*
    gets and places markers that the server sends from pstartDate to endDate in pintervals for the pvechile on pmap
 */
function placeLotsOfMarkers(pmap, pstartDate, pendDate, pinterval, pvehicleId, transitIQImage, nextBusImage)
{
    //initilizes variables
    var map = pmap;
    var endDate = pstartDate;
    var startDate = pendDate;
    var interval = pinterval;
    var bounds = new google.maps.LatLngBounds();
    var numIntervals = (endDate.getTime() - startDate.getTime()) / interval;
    var currentInterval = 1;
    var markers = [];

    var url =
    {
        allMarkers: "http://transitiqdatareceiver.cloudapp.net/DataReceiver.svc/GetRawCoords",
        vehicleId: pvehicleId,
        key: "DcCi",
        toUTC: new Date(startDate.getTime() + (interval)),
        fromUTC: startDate,
        markerURL: function markerURL()
        {
            return url.allMarkers + "?vehicleId=" + url.vehicleId + "&key=" + url.key + "&toUtc=" + (url.toUTC.toJSON()).substr(0,19) + "&fromUtc=" + (url.fromUTC.toJSON()).substr(0,19) + "&format=json";
        }
    };

    placeIncrement(interval);

    return {
        bounds: bounds,
        markers: markers
    };

    //helper function that acts like a loop which calls nested ajax calls to get info from the server in increments
    //when it gets one increment it further until it hits the end
    function placeIncrement(ppinterval)
    {
        //base case. if the url.toUTC time is smaller then the end time it keeps going otherwise fizzles out
        if (url.toUTC.getTime() <= endDate.getTime())
        {
            //grabs info from server
            $.ajax(
                {
                    url: url.markerURL(),
                    jsonp: "callback",
                    dataType: "jsonp",
                    success: function (info)
                    {
                        //places markers from with the info gotten from the server
                        placeInformation(info, (25 * currentInterval) / numIntervals);

                        currentInterval++;

                        //moves up the to and from UTC to
                        url.fromUTC = url.toUTC;
                        url.toUTC = new Date(url.fromUTC.getTime() + ppinterval);

                        placeIncrement(ppinterval);
                    },
                    error: function ()
                    {
                        alert("Failed to retrieve info!");
                    }
                });
        }

        function placeInformation(information, size) {
            var infoWindow;
            var latlng;

            //iterates through the array of information
            for (var index = information.length - 1; index >= 0; index--) {
                (function makeMarkers() {

                    //makes a local variable of data that is being used
                    var current = information[index];

                    //sets the apropreate image for the marker
                    var markerImage = transitIQImage;
                    if (current.DeviceId == null)
                        markerImage = nextBusImage;

                    //grabs the location for the marker from current and adds it to the bounds of the map
                    latlng = new google.maps.LatLng(current.Lat, current.Lon);
                    bounds.extend(latlng);

                    //calculates the size diffrence between every data point
                    var mSize = ((index * size) / information.length) + 10;

                    //makes the marker image with the size and sets the origin on the center of the image
                    var image = {
                        url: markerImage,
                        size: new google.maps.Size(mSize, mSize),
                        origin: new google.maps.Point(mSize / 2, mSize / 2)
                    };

                    //makes the marker
                    var marker = new google.maps.Marker
                    (
                        {
                            map: map,
                            icon: image,
                            title: allMarkers.length + "",
                            position: latlng,
                            visible: false
                        }
                    );

                    //makes the info window
                    var time = current.ReportDateUtc;
                    time = time.substring(time.indexOf("(") + 1, time.indexOf(")"));
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
                    google.maps.event.addListener(marker, 'click', function makeWindows() {
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
                })();
            }
        }
    }
}