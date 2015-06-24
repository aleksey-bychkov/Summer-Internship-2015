function doThings()
{
    var publicAPI =
    {
        clearMarkers: clearMap,
        addListToElement: addListToElement,
        updateShowingOnlyNextBus: updateShowingOnlyNextBus,
        setBase: setBase,
        setMap: setMap,
        setNextBusImage: setNextBusImage,
        setTransitIQImage: setTransitIQImage
    };

    var map;
    var showingOnlyNextBus = false;
    var transitIQImage = 'transitIQ.png';
    var nextBusImage = 'nextBus.png';
    var allMarkers = [];
    var buses = [];
    var infoWindow;
    var url =
    {
        markerList: "http://transitiqdatareceiver.cloudapp.net/DataReceiver.svc/GetRawCoords",
        busList: "http://transitiqapi.cloudapp.net/Service.svc/VehiclesListForServiceDate",
        key: "DcCi",
        markerURL: function markerURL(fromUTC, toUTC, vehicleId)
        {
            return url.markerList + "?vehicleId=" + vehicleId + "&key=" + url.key + "&toUtc=" + (toUTC.toJSON()).substr(0,19) + "&fromUtc=" + (fromUTC.toJSON()).substr(0,19) + "&format=json";
        },
        busListURL: function busListURL(date)
        {
            return url.busList + "?orgId=" + url.key + "&serviceDate=" + date.toJSON().substr(0,10) + "&inServiceOnly=true&activeDevicesOnly=true&format=json";
        }
    };

    return publicAPI;

    //updates the variables inside.
    function setBase(pmarkerList, pkey, pbusList)
    {
        url.markerList = pmarkerList;
        url.busList = pbusList;
        url.key = pkey;
    }

    //sets the map the the paramater map
    function setMap(pmap)
    {
        map = pmap;
    }

    //sets the image for the marker that show that the DeviceID is null
    function setNextBusImage(pmarkerImage)
    {
        nextBusImage = pmarkerImage;
    }

    //sets the image for the marker that show that the DeviceID isn't null
    function setTransitIQImage(pmarkerImage)
    {
        transitIQImage = pmarkerImage;
    }

    //when calles changes ShowingOnlyNextBus calls shows and returns the new ShowingOnlyNextBus value
    function updateShowingOnlyNextBus(checkBox)
    {
        showingOnlyNextBus = checkBox.checked;
        show();
    }

    //adds a list of all the active buses to the toAddToElementID
    function addListToElement(toAddToElementID)
    {
        $.ajax(
            {
                url: url.busListURL((new Date())),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    if(data.length >= 1)
                        addAll(toAddToElementID, data);
                    else
                    {
                        alert("No buses");
                    }
                },
                error: function ()
                {
                    alert("Failed to retrieve info!");
                }
            });


        function addAll(addElementID, data)
        {
            var end = new Date();
            var start = new Date(end.getTime() - (2 * 60 * 60 * 1000));

            for(var index = 0; index < data.length; index++)
            {
                (function addBus()
                {
                    var current = data[index];

                    //List element added to the page
                    var $busListNode = $("<li>",
                    {
                        id: current.VehicleId
                    });

                    //checkbox for the page
                    var $checkbox= $(document.createElement('input')).attr(
                    {
                        id:    "cb" + current.VehicleId,
                        type:  'checkbox'
                    });

                    //adds the checkbox to the element along with the mane of the element
                    $busListNode.append($checkbox);
                    $busListNode.append(current.VehicleType+ " " + current.VehicleId);

                    //element added to buses array
                    var toAdd =
                    {
                        busNumber: current.VehicleId,
                        bounds: new google.maps.LatLngBounds(),
                        markers: [],
                        checked: false,
                        made: false
                    };

                    $busListNode.click(function onClick()
                    {
                        toAdd.checked = $checkbox.is(":checked");

                        //if the markers have already been made turns them on
                        if(!toAdd.made && toAdd.checked)
                        {
                            //places the markers
                            var temp = placeLotsOfMarkers(start, end, 900000, current.VehicleId);

                            //updates toAdd's markers and bounds
                            toAdd.markers = temp.markers;
                            toAdd.bounds = temp.bounds;

                            toAdd.made = true;
                        }
                        else
                        {
                            infoWindow = undefined;

                            //iterates throught the markers and applies and sets the visavility on the status of the checkboxs checked status
                            for (var markerIndex = 0; markerIndex < toAdd.markers.length; markerIndex++)
                            {
                                (function () {
                                    if(showingOnlyNextBus)
                                    {
                                        if(toAdd.markers[markerIndex].icon.url === transitIQImage)
                                            toAdd.markers[markerIndex].setVisible(false);
                                        else
                                            toAdd.markers[markerIndex].setVisible(toAdd.checked);
                                    }
                                    else
                                    {
                                        toAdd.markers[markerIndex].setVisible(toAdd.checked);
                                    }
                                }());
                            }
                        }

                        //makes the bounds work
                        var bounds = new google.maps.LatLngBounds();

                        //goes through all the buses and extends the bounds of the map to include them IF they aren't the default bounds
                        for(var x = 0; x < buses.length; x++)
                        {
                            if(buses[x].made && buses[x].checked)
                            {
                                if (!buses[x].bounds.equals(new google.maps.LatLngBounds()))
                                    bounds.union(buses[x].bounds);
                            }
                        }

                        //resets the bounds
                        map.fitBounds(new google.maps.LatLngBounds(null));

                        //set the bounds on the bounds of the markers OR on the whitehouse if default bounds
                        if(!bounds.equals(new google.maps.LatLngBounds()))
                            map.fitBounds(bounds);
                        else
                        {
                            map.panTo(new google.maps.LatLng(38.8977, -77.0366));
                            map.setZoom(15);
                        }
                    });

                    //adds the current bus to the array of buses
                    buses.push(toAdd);

                    //adds the eleemt to the page
                    $("#" + addElementID).append($busListNode);
                })();
            }

        }
    }

    //places markers from pStartDate to pEndDate with the VehicleId of pVehicleId on the map
    function placeLotsOfMarkers(pStartDate, pEndDate, pInterval, pVehicleId)
    {
        var endDate = pEndDate;
        var startDate = pStartDate;
        var interval = pInterval;

        var bounds = new google.maps.LatLngBounds();
        var numIntervals = (endDate.getTime() - startDate.getTime()) / interval;
        var currentInterval = 1;
        var markers = [];

        var startTime = startDate;
        var endTime = new Date(startDate.getTime() + (interval));

        placeIncrement(interval);

        return {
            bounds: bounds,
            markers: markers
        };

        function placeIncrement(pinterval)
        {
            if(endTime.getTime() <= endDate.getTime())
            {
                $.ajax(
                    {
                        url: url.markerURL(startTime, endTime, pVehicleId),
                        jsonp: "callback",
                        dataType: "jsonp",
                        success: function (info)
                        {
                            startTime = endTime;
                            endTime = new Date(startTime.getTime() + pinterval);
                            currentInterval++;

                            placeIncrement(pinterval);

                            placeInformation(info, (25 * currentInterval) / numIntervals);
                        },
                        error: function ()
                        {
                            alert("Failed to retrieve info!");
                        }
                    });
            }

            function placeInformation(information, size)
            {
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
                        var image =
                        {
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
                                visible: true,
                                information: current
                            }
                        );

                        //makes the info window
                        var time = current.ReportDateUtc;
                        time = time.substring(time.indexOf("(") + 1, time.indexOf(")"));
                        time = new Date(parseInt(time));

                        var content = '<div id="content">' +
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
    }

    //if showingOnlyNextBus is true then only shows showingOnlyNextBus
    function show()
    {
        //checks the buses first
        for(var index=0; index < buses.length; index++)
        {
            //if the bus is checked checks for next bus markers
            if(buses[index].checked)
            {
                for(var x = 0; x < buses[index].markers.length; x++)
                {
                    (function()
                    {
                        var current =  buses[index].markers[x];
                        if(showingOnlyNextBus)
                        {
                            if(current.icon.url === transitIQImage)
                                current.setVisible(false);
                            else
                                current.setVisible(true);
                        }
                        else
                        {
                            current.setVisible(true);
                        }
                    }());
                }
            }
        }
    }

    //clears the map of all allMarkers
    function clearMap()
    {
        for(var i = 0; i < allMarkers.length; i++)
        {
            allMarkers[i].setMap(null);
        }

        allMarkers = [];
    }
}