# railsonify

__Done:__
* Removed ambiguity for non-exact search queries: Now returns station with the highest footfall relating to the input string (i.e. 'London' will return Waterloo, as London Waterloo has a higher footfall than the other 'London' stations such as Kings Cross). 
* Built counties map of UK from Topojson -> Geojson data, map file can be edited to change the shape/border vectors of the map at any time.

Todo: 
1. Update matching functionality to include lowercase.
2. Set variable within server file to store station code, will allow re-writing of data on an interval (given the code matches that stored elsewhere - verif?). 
3. Set up location storing again - maybe use another API if available to find the route information between stations so routes can be drawn on maps at a later point. 
4. Look at leaflet and d3 to start processing and drawing lon, lat on maps. 
5. [When information is back on mappings]: Implement audio with mapping crtier

Notes:
1. Database refresh every 5 minutes, hopefully enough time to find updates to timetable issues (lateness, ect). 
2. Fire audio output when trains depart - harmonicity depedent on lateness (disonance for late leaving trains). 
3. Slow release pad sounds, different sounds/notes dependent on train operator? 
4. Panning dependent on direction of leaving train, shown by the drawn path. 
5. Drawing of routes can be depdendent on the total time taken between points - the longer the time, the longer it takes to draw the path.
6. Multiple station departures can have their playback dependent on a weighting decided by the footfall ranking of the arrival station - perhaps scalable gain control?
