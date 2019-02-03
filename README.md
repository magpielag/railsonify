# railsonify

Todo: 
1. Update matching functionality to include lowercase, and matching of closest station name to codes - could also sort by popularity (footfall), but probably not worth it.
2. Set variable within server file to store station code, will allow re-writing of data on an interval (given the code matches that stored elsewhere - verif?). 
3. Set up location storing again - maybe use another API if available to find the route information between stations so routes can be drawn on maps at a later point. 
4. Look at leaflet and d3 to start processing and drawing lon, lat on maps. 
5. [When information is back on mappings]: Implement audio with mapping crtier

Notes:
1. Database refresh every 5 minutes, hopefully enough time to find updates to timetable issues (lateness, ect). 
2. Fire audio output when trains depart - harmonicity depedent on lateness (disonance for late leaving trains). 
3. Slow release pad sounds, different sounds/notes dependent on train operator? 
4. Panning dependent on direction of leaving train, shown by the drawn path. 
