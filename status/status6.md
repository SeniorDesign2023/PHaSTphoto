## Recap of what was planned for the last 3 weeks 
- We had some final features to implement after our meeting with our mentor. We also needed to put together our presentation and create a video highlighting key features of our product.
## Tasks Completed What was done during the last 3 weeks (by whom) 
1. Description of tasks completed & quantifiable metrics
- Buck: Implemented boolean switcher for photos and compressed images for ChatGPT (8 hours)
- Matty: put together the video, worked on the presentation(~15-20 hours)
- Connor: Worked with Cody on implementing a loading bar/spinner. UI tweaks. worked on the presentation. (8 hours)
- Cody: Tried to implement a loading bar. Worked with Connor on final loading display Implemented live tag updates to gray out incompatible tags. Worked on the presentation. (12 hours)
## Successes
1. What are your accomplishments?
Got “OR” boolean tag combinations implemented
Put together our full presentation
Created and submitted our video
Converted photos to a compressed format to be uploaded to chatgpt in order to save time and money
Implemented code to gray out tags that are incompatible with the currently selected tags.
Implemented loading spinner.
Presented to class
2. What solutions were successful?
- For the grayed-out tags, it ended up being easier to just set the opacity to 50% than actually changing the color to gray. This changed the opacity of the checkboxes as well, rather than having the checkbox stay the same color while the text color was changed.
- Adding a loading spinner.
3. Were there other things that you tried that did not work and why?
- For the grayed-out tags, we tried to set the color of each selection to gray. This did not work, because the checkboxes stayed the same color which looked wrong. We didn’t want to disable the tag checkboxes (which would gray out the checkboxes as well), and highlighting the entire selection with gray also looked weird.
- We tried using a loading bar, but the bar didn’t match the actual progress of the upload.
## Roadblocks/Challenges
1. Describe the challenges
- Couldn’t figure out how to gray out the checkboxes of the tags that were incompatible with the current tag selection without actually disabling the checkbox.
- Couldn’t figure out how to get a loading bar to match the actual progress when uploading photos.
2. Describe how you overcame them
- Changed the opacity of the checkboxes and text instead of the color.
- Instead of using a loading bar, we just used a loading spinner. This may not be as desirable as a loading bar, but it still works.
3. What challenges are still left?
- Adding session id’s/persistent photos. Each photo would be given a session id in the database so that going back to your session would allow you to see all of your photos and their tags without reuploading.
4. What do you need help with? How can your mentor help?
- If the semester wasn’t so close to being over, we would likely need help on ideas for implementing the features listed in the Goals section below. However, we are happy with how the project has turned out so far, and believe that it is done/mostly done.
## Changes/Deviation from Plan ​(if applicable - if not, say so!)
- no deviations. This was several weeks of wrapping things up and tying off loose ends.
## Details Description of Goals/ Plan for ​Next 3 Weeks [5pts]
- The obvious direction of this project would be to fill out features that support a large number of commercial users. This would mean implementing a login management system with secure password storage and persistent storage of photos. We would also need to put together a billing system for premium users who intend to use AI tagging. Some features that would be a healthy addition to the ones that we have would be more accurate geospatial tagging, text extraction searching, custom user-applied tags, and cloud storage.
## Confidence on completion from each team member + team average [5 pts]
Scale of 1-5; 1 = not-confident; 3 = toss-up; 5 = confident
- Buck- 5
- Cody - 5
- Connor - 5
- Matty - 5
- Average - 5
