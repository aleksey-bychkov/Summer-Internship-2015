function makePage()
{
    var publicAPI =
    {
        clearMap: clearMap,
        replaceBusList: replaceBusList,
        updateShowingOnlyNextBus: updateShowingOnlyNextBus,
        setServerAddress: setServerAddress,
        setMap: setMap,
        setNextBusImage: setNextBusImage,
        setTransitIQImage: setTransitIQImage,
        setTime: setTime
    };

    var map;
    var showingOnlyNextBus = false;
    var transitIQImage = 'transitIQ.png';
    var nextBusImage = 'nextBus.png';
    var allMarkers = [];
    var buses = [];
    var infoWindow;
    var endDate = new Date();
    var startDate = new Date(endDate.getTime() - (60 * 60 * 1000));


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

    //updates the location of the from where the location is retrived
    function setServerAddress(pmarkerList, pkey, pbusList)
    {
        url.markerList = pmarkerList;
        url.busList = pbusList;
        url.key = pkey;
    }

    //sets the time for the
    function setTime(pendTime, pstartTime)
    {
        endDate = pendTime;
        startDate = pstartTime;

        clearMap()
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

    //adds a list of all the active buses to the elementToReplaceID
    function replaceBusList(elementToReplaceID)
    {
        $.ajax(
            {
                url: url.busListURL((new Date())),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    $("#" + elementToReplaceID).replaceWith(makeBusList(data));
                },
                error: function ()
                {
                    alert("Failed to retrieve info!");
                }
            });

        //adds all the data to to the element with the ID of "addElementID"
        function makeBusList(data)
        {
            var $BusList = $("<ul>",
            {
                id: "BusList" + (new Date()).toJSON()
            });

            for(var index = 0; index < data.length; index++)
            {
                (function addBus()
                {
                    var current = data[index];

                    //List element added to the page
                    var $bus = $("<li>",
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
                    $bus.append($checkbox);
                    $bus.append(current.VehicleType+ " " + current.VehicleId);

                    //element added to buses array
                    var toAdd =
                    {
                        busNumber: current.VehicleId,
                        bounds: undefined,
                        markers: [],
                        made: false
                    };

                    $bus.click(function onClick()
                    {

                        //if the markers have already been made turns them on
                        if(!toAdd.made && $(toAdd.checkBox).is(":checked"))
                        {
                            //places the markers
                            var temp = placeLotsOfMarkers(startDate, endDate, 900000, current.VehicleId);

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
                                (function ()
                                {
                                    if(showingOnlyNextBus)
                                    {
                                        if(toAdd.markers[markerIndex].icon === transitIQImage)
                                            toAdd.markers[markerIndex].setOptions({visible: false});
                                        else
                                            toAdd.markers[markerIndex].setOptions({visible: $(toAdd.checkBox).is(":checked")});
                                    }
                                    else
                                    {
                                        toAdd.markers[markerIndex].setOptions({visible: $(toAdd.checkBox).is(":checked")});
                                    }
                                }());
                            }

                            updateBounds();
                        }


                    });

                    //adds the current bus to the array of buses
                    buses.push(toAdd);
                    toAdd.checkBox = $checkbox;

                    //adds the list item to the $BusList
                    $BusList.append($bus);
                })();
            }

            return $BusList
        }
    }

    //places markers from pStartDate to pEndDate with the VehicleId of pVehicleId on the map
    function placeLotsOfMarkers(pstartDate, pendDate, interval, vehicleId)
    {
        var numIntervals = (pendDate.getTime() - pstartDate.getTime()) / interval;
        var currentInterval = 0;
        var markers = [];
        var bounds = [];

        var $progressbar = $("#progressbar");

        $progressbar.progressbar("value", 0);


        placeIncrementOfMarkers(interval, pstartDate, new Date(pstartDate.getTime() + interval));


        return {
            bounds: bounds,
            markers: markers
        };

        function placeIncrementOfMarkers(pinterval, pstartTime, pendTime)
        {
            if(pendTime.getTime() <= endDate.getTime())
            {
                $.ajax(
                    {
                        url: url.markerURL(pstartTime, pendTime, vehicleId),
                        jsonp: "callback",
                        dataType: "jsonp",
                        success: function (info)
                        {
                            placeInformation(info, (25 * currentInterval) / numIntervals);


                            $progressbar.progressbar("value", (($progressbar.progressbar("value")) + 100/numIntervals));

                            pstartTime = pendTime;
                            pendTime = new Date(pstartTime.getTime() + pinterval);
                            currentInterval++;

                            updateBounds();

                            placeIncrementOfMarkers(pinterval, pstartTime, pendTime);
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


                        //grabs the location for the marker from current and adds it to the bounds of the map
                        latlng = new Microsoft.Maps.Location(current.Lat, current.Lon);
                        bounds.push(latlng);

                        //calculates the size diffrence between every data point
                        var mSize = ((index * size) / information.length) + 10;

                        //gets the content of the info window
                        var time = current.ReportDateUtc;
                        time = time.substring(time.indexOf("(") + 1, time.indexOf(")"));
                        time = new Date(parseInt(time));

                        var content = "Agency Id: " + current.AgencyId + "\n" +
                            "Device Id: " + current.DeviceId + "\n" +
                            "Is Standing: " + current.IsStanding + "\n" +
                            "Location: " + latlng.toString() + "\n" +
                            "Vehicle Id: " + current.VehicleId + "\n" +
                            "Time: " + time + "\n";


                        //makes the marker
                        var marker = new Microsoft.Maps.Pushpin(latlng,
                            {
                                icon: transitIQImage,
                                height: mSize,
                                width: mSize,
                                anchor: new Microsoft.Maps.Point(mSize / 2, mSize / 2),
                                draggable: false,
                                visible: true,
                                zIndex: 5,
                                infobox: new Microsoft.Maps.Infobox(latlng,
                                {
                                    title: "Information",
                                    description: content,
                                    zIndex: 15
                                })
                            });

                        //sets the apropreate image and z index for the markers
                        if (current.DeviceId == null)
                        {
                            marker.setOptions({
                                zIndex: 10,
                                icon: nextBusImage
                            });
                        }

                        if(showingOnlyNextBus)
                            if(marker.icon._url == transitIQImage)
                                marker.setOptions({visible: false});


                        Microsoft.Maps.Events.addHandler(marker, 'click', function()
                        {
                            //if a infoWindow already exsits closes it
                            if(infoWindow)
                                map.entities.remove(infoWindow);

                            //resets the infoWindow and makes the current infoWindow visible
                            infoWindow = marker._infobox;
                            map.entities.push(infoWindow);
                        });

                        map.entities.push(marker);

                        //adds the markers to the total markers on the map and the array of markers added
                        markers.push(marker);
                        allMarkers.push(marker);

                    })();
                }
            }
        }
    }

    //updates the bounds of the map according to all the checked buses
    function updateBounds()
    {
        //makes the bounds work
        var bounds = [];

        //goes through all the buses and extends the bounds of the map to include them IF they aren't the default bounds
        for(var x = 0; x < buses.length; x++)
        {
            if(buses[x].made && $(buses[x].checkBox).is(":checked"))
            {
                Array.prototype.push.apply(bounds, buses[x].bounds);
            }
        }

        bounds = Microsoft.Maps.LocationRect.fromLocations(bounds);

        //set the bounds on the bounds of the markers OR on the whitehouse if default bounds
        if(bounds.toString() == Microsoft.Maps.LocationRect.fromLocations().toString())
        {
            map.setView({bounds: Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(38.8977, -77.0366))});
        }
        else
        {
            map.setView({ bounds: bounds});
        }
    }

    //Makers sure the visible markers are corresponding to the status of showingOnlyNextBus
    function show()
    {
        //checks the buses first
        for(var index=0; index < buses.length; index++)
        {
            //if the bus is checked checks for next bus markers
            if($(buses[index].checkBox).is(":checked"))
            {
                for (var markerIndex = 0; markerIndex < buses[index].markers.length; markerIndex++)
                {
                    if(showingOnlyNextBus)
                    {
                        if(buses[index].markers[markerIndex]._icon == transitIQImage)
                            buses[index].markers[markerIndex].setOptions({visible: false});
                        else
                            buses[index].markers[markerIndex].setOptions({visible: true});
                    }
                    else
                    {
                        buses[index].markers[markerIndex].setOptions({visible: true});
                    }
                }
            }
        }
    }

    //clears the map of all allMarkers
    function clearMap()
    {
        //destroys all association between markers and the map from there secondary location
        for(var index=0; index < buses.length; index++)
        {
            buses[index].markers = [];
            $(buses[index].checkBox).prop('checked', false);
            buses[index].made = false;
        }

        allMarkers = [];
        infoWindow = undefined;

        map.entities.clear();

        updateBounds();
    }
}