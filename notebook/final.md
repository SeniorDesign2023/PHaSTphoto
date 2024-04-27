# Final Project Notebook

# Synopsis of project goal(s)
- Our goal was to build a simple, interactive, and intuitive application for organizing large collections of photos. We wanted our app to include the basic features that are expected of other photo management apps, including importing and exporting capabilities, some kind of searching/filtering functionality, and a visually appealing user interface. Beyond these basic features, we set out to incorporate more advanced options for how a user can interact with their photos. To achieve this, we implemented AND/OR boolean searching, live filtering of tags and photos, AI-generated tags, and custom tags.
# Link to all written status updates
- status1.md: https://github.com/SeniorDesign2023/PHaSTphoto/blob/main/status/status1.md
- status2.md: https://github.com/SeniorDesign2023/PHaSTphoto/blob/main/status/status2.md
- status3.md: https://github.com/SeniorDesign2023/PHaSTphoto/blob/main/status/status3.md
- status4.md: https://github.com/SeniorDesign2023/PHaSTphoto/blob/main/status/status4.md
- status5.md: https://github.com/SeniorDesign2023/PHaSTphoto/blob/main/status/status5.md
- status6.md: https://github.com/SeniorDesign2023/PHaSTphoto/blob/main/status/status6.md
# Links to all videos created
- https://youtu.be/gaPr9WcSKXw
# Project Planning and Execution
A. Link to Design Requirements & Specification
- https://github.com/SeniorDesign2023/PHaSTphoto/blob/main/planning/planning.md

B. Finalized Plan of Work (including expected vs actual)
- https://github.com/SeniorDesign2023/PHaSTphoto/blob/main/planning/final.md
- NOTE: This document contains the expected finalized plan of work. The following notes explain the changes from this document to how our project actually turned out:
	- Project Overview: We did not implement the NOT boolean operator or the ability for the app to automatically organize the user’s repository. What we mention are some of the more advanced features that we ended up implementing.
	- Team Members and role: We quickly abandoned the assigned roles and began to collaborate on different parts of the project as we saw fit.
	- Functional Requirements of Final Project/MVP: Our description of the MVP is mostly correct. However, we added much more functionality in the final version than we originally planned on.
	- Systems Overview: We decided not to use a search bar in the final product. Instead, we gave the user the option to switch between AND and OR by clicking a button and then selecting tags. Our backend used node.js and express.js. We ended up using MongoDB, but the explanation for the implementation of our database remained the same.
	- Major Milestones: We didn’t link external storage locations or provide persistent photo storage. However, we had other significant achievements to make up for this.
	- Major Tasks: We did not host our website online. The major tasks we actually completed mostly involved adding more advanced filtering features to our app.
	- Stretch goals: Our stretch goals changed from the ones listed to the following: adding a login management system, implementing persistent photos, allowing more file types, and adding cloud storage. 
# Summary of Final Implementation:
A. Design
- Our final product is built around two main pages, the home/upload page and the tag selection page. The home page greets users with the product name/logo and a prompt to upload their photos. The banner across the top of the page also reveals some of the capabilities of the product by giving the users labeled buttons for uploading photos, clearing photos, enabling AI tagging, and switching between AND/OR tagging. After the user uploads their photos and possibly selects additional tagging options, they can view their photos on the tag selection page. Here, they can then select a combination of tags, view the search results, and download their selection of photos. 

B. Limitations
- Some of the functions we wrote are somewhat rigid. For example, the geospatial information only accounts for a couple of predefined locations, and the seasons only work for the northern hemisphere. 
- The user has to re-upload their photos every time they reload the page, i.e. there is no persistent photo storage.
- Uploading too many photos causes significant loading times and can exceed the maximum allowable ChatGPT API call length.

C. Future Direction
- In the future we need to implement a login management system. This will go hand in hand with persistent photo storage allowing users to log in and see the photos that they have previously uploaded. We would also like to add the ability to process more file types, implement cloud storage, and implement manual photo tagging. We would also need to create a premium version of the application that users can subscribe to in order to pay for ChatGPT API calls.

D. Statement of Work
1. Whole team
- We worked on all the documents together, passed around a lot of code work, bounced ideas off of each other, and  worked on the slideshow together. Often, we laid the groundwork for each other so that another member could take over and improve on what was suggested/started.
2. 1 per team member
- Matty: Worked on live photo updates, custom tagging, the presentation  and the project video.
- Buck: Worked on getting the initial project up and running, worked on the boolean switcher, and AI tagging.
- Cody: Worked on live tag updates, frontend design refactoring, photo display, photo enlargement on click, squashed bugs, assisted Matty with live photo updates, and helped fill out initial  information on slideshow.
- Connor: Set up database, initial structuring of UI/style, button UI, clear photo functionality, naming download folder, loading display, assisting Buck with tag handling, filling out and cleaning up slideshow info.
# Reflection on the team's ability to design, implement, and evaluate a solution.
A. Lessons Learned
- We learned the importance of getting started as early as possible and keeping a consistent work schedule. Our project involved a lot of trial and error, so having enough time to try different approaches and revise code was very important.
- We learned to communicate and coordinate our work with each other better. We struggled with this initially, and it cost us time and stress. After our communication improved, we became more efficient as a group and were able to make higher quality work.
- We learned how to create an appealing User Interface to make our product more usable and intuitive to use. Just by changing the design, our product started to feel much more valuable.

B. "If you had to do it all over again"
- If we had to do it all over again the one thing that would be changed is to communicate better. We had a couple of instances where two team members were working on similar things and one finished first rendering the other member's time useless. This was frustrating for the member that got their code overwritten. 
- Another thing we would change would be to try to work together more on our tasks. The few times that this did happen, the work took less time and we were less error prone.

C. Advice for future teams
- Find at least one time each week to meet as a team to work on the project.
- Become good friends with your team members: this makes it easy to work with them, and also makes it easier to hold them accountable for work that they need to do. 
- Make sure to pick a project that you are at least somewhat passionate about, as this makes the work more enjoyable and less burdensome. You will also feel more proud of your final product.


