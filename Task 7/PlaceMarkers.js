/*
    Takes in a Google map along with a vehicleID, a start time, an end time. Along with the nextBusImages and transitIQImage for the markers.
    requests a set of files from a server and maps the points on the map
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
        show();
    }
}