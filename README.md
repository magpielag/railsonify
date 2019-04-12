# railsonify
_Instructions:_
To install this project, clone to a local directory, cd into the node_modules folder and install npm packages using:
```
npm install
```

Once installed, cd back to the root folder 'railsonify-master' and run:
```
node lib/server
```

To access the application once the server is running, open a Chrome browser and navigate to localhost:5000

_Known issues:_
1. Canvases can be out of line with each other on certain desktop resolutions (larger or smaller than 1080p) due to absolute offsets.
2. Database error when monitoring a large number of stations: Stop server, manually remove 'database.db' and start server.

_Roadmap:_

0. Developed protoype application to collect user feedback of difficulty in aligning geolocational data in two-dimensions to a playback sound sonified using a set of one-to-one parameter mappings. 
1. Identified existing projects within the area: web applications utilising data for sonification.
2. Identified the core frameworks and libraries utilised within existing projects to aid in the simplification of prototype and final product. 
3. Developed the basic UI concepts and elements using vanilla JS (to cut down on libraries required). 
4. Developed the background systems required to pull, store, delete, and update live timetable and discrete geolocational route data from an online API. 
5. Added initial audio concepts using simplified interactions and mappings based upon the findings in step 0. 
6. Improved mappings.
7. Testing.
8. Performance improvements and amendments.
