function doThings()
{
    var publicAPI =
    {
        update: updateInfo,
        setMap: setMap,
        place: place,
        setNotNullImage: setNotNullImage,
        setNullImage: setNullImage,
        clearMarkers: clearMap,
        setList: setList
    };

    var map;
    var markerImageNotNull = 'markerImageNotNull.png';
    var markerImageNull = 'markerImageNull.png';
    var markers = [];
    var url =
    {
        pathway: "http://transitiqdatareceiver.cloudapp.net/DataReceiver.svc/GetRawCoords",
        vehicleId: "1103",
        key: "DcCi",
        toUTC: new Date("2015-06-05T17:00:00"),
        fromUTC: new Date("2015-06-05T16:50:01"),
        toString: function toString()
        {
            return this.pathway + "?vehicleId=" + this.vehicleId + "&key=" + this.key + "&toUtc=" + (this.toUTC.toJSON()).substr(0,19) + "&fromUtc=" + (this.fromUTC.toJSON()).substr(0,19) + "&format=json";
        }
    };

    return publicAPI;

    //updates the variables inside.
    // 1) 6 param takes in a path, vehicleId, key, a start time(Date object) and and end time(A Date object)
    function updateInfo(ppath, pvehicleId, pkey, ptoUTC, pfromUTC)
    {
        url.pathway = ppath;
        url.vehicleId = pvehicleId;
        url.key = pkey;
        url.toUTC = ptoUTC;
        url.fromUTC = pfromUTC;
    }

    //sets the map the the paramater map
    function setMap(pmap)
    {
        map = pmap;
    }

    //sets the image for the marker that show that the DeviceID is null
    function setNullImage(pmarkerImage)
    {
        markerImageNull = pmarkerImage;
    }

    //sets the image for the marker that show that the DeviceID isn't null
    function setNotNullImage(pmarkerImage)
    {
        markerImageNotNull = pmarkerImage;
    }

    //public method that places markers on the map using the information it has
    function place()
    {
        clearMap();

        $.ajax(
            {
                url: url.toString(),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    if(data.length >= 1)
                        placeMarkers(data);
                    else
                    {
                        var toRed = $("#bus-list-1").find(".selected");
                        toRed[0].className = ".notWorking";
                        alert("Data was empty");
                    }

                },
                error: function ()
                {
                    alert("Failed to retrieve info!");
                }
            });

        //takes in an array of JSON objects and adds makers on a map based off of the array
        function placeMarkers(information)
        {
            markers = [];
            map.fitBounds(new google.maps.LatLngBounds(null));

            var infoWindow;
            var size = 30;
            var bounds = new google.maps.LatLngBounds(null);
            var latlng;

            for(var index = information.length-1; index >= 0; index--)
            {
                (function makeMarkers()
                {
                    var current = information[index];
                    var markerImage = markerImageNotNull;

                    latlng = new google.maps.LatLng(current.Lat, current.Lon);

                    bounds.extend(latlng);

                    var mSize = (index * size)/information.length;

                    if(current.DeviceId == null)
                        markerImage= markerImageNull;

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
                            map: map,
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

                        //binds the infoWindow to the marker&map
                        infoWindow.open(map, marker);
                    });

                    //adds the markers
                    markers.push(marker);
                })();
            }

            map.fitBounds(bounds);
        }
    }

    //clears the map of all markers
    function clearMap()
    {
        for(var i = 0; i < markers.length; i++)
        {
            markers[i].setMap(null);
        }

        markers = [];
    }
}

function setList(toAddToElement, toAdd)
{
    for(var index = 0; index < toAdd.length; index++)
    {
        (function addBuses()
        {
            var current = buses[index];
            var busListNode = document.createElement("li");
            busListNode.id = "Bus" + index;

            var bus = document.createTextNode("" + current);
            busListNode.className = "notSelected";

            busListNode.appendChild(bus);

            busListNode.onclick = function ()
            {

                var old = $("#bus-list-1").find(".selected");
                for(var x=0; x<old.length; x++)
                {
                    old[x].className = "notSelected";
                }

                busListNode.className = "selected";


                task7.update(document.getElementById("urlHeader").value, old[0].innerHTML, document.getElementById("key").value, new Date(), new Date((new Date().getTime() - ((document.getElementById("drop-down").value) * 60000))));
                task7.place();
            };

            document.getElementById(toAddToElement).appendChild(busListNode);
        })();
    }
}