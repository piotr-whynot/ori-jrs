possible scrolls:

from menu:
dataset -> map
	updates: location, dataset and map
	cleans: figure and data

location -> location?
	updates: location, dataset and map
	cleans: figure and data

datastream -> figure
	updates: figure, location, dataset and map and data
	

from dataset:
- location -> location? or map?
	updates: location and map - but without loading dataset
	cleans: data and figure


from map:
-  location -> location
	updates location



from location:
- datastream -> figure
	updates figure
