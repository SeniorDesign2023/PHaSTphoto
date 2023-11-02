1. Minimum Viable Product
- a. Our minimum viable product will be a simple photo gallery desktop application that allows users to upload photos, displays them in a grid layout, and offers basic filtering features.

2. Descriptions, Diagrams, User Interactions
- a. We will allow users to upload images, then we display them in a grid layout on the right side of the home page.
- b. Clicking on an image will enlarge it to fill the page, and there will be a short description/list of tags for the image.
- c. There will be a drop-down menu on the left of the home page that allows the user to apply preset filters.
- There will be a menu bar at the top of the home page that has upload, filter, and clear options.
-- The upload section redirects to a page with an input box and an “upload” button.
-- The filter section redirects to a page that will allow the user to enter search keywords in a boolean format. These filters will be applied to the images on the home page.
-- The clear option clears all currently applied filters.
- Any filters that the user applies will be saved until the user changes them.
- Uploading new photos and clicking next will create a popup that allows the user to either apply the current filter again or to search with a new filter. This new filter will apply across all photos

3. Tasks
- Maybe, figure out how to use the GPT-4 API to tag images
-- Might need to pay. That’s okay with us.
- Create an intuitive boolean searching system.
- Create a database to store each image and its tags/metadata.
- Find a way to store the current filter, which will be remembered until the user clears it. Shutting down the program/machine will not reset the filter, previous filter will be saved
