1. Project overview
- Our PHaST photo application will be an image filtering/management service. The user will provide access to a repository of photos, and our application will generate tags for each photo that can then be used by the user to search through their photos. We will provide an intuitive interface to allow basic boolean search capabilities (and, or, not). Our application will display the results of a search and give the user the option to download the photos or have their repository automatically organized (if allowed by the repository source).
2. Team members and roles
- Matty
  - Role: Front-end design.
  - Bio: Senior computer science student with experience in Python, C, Java, Golang, Scala, and C++
- Buck
  - Role: Storage/database design
  - Bio: Junior math and computer science student with experience in Python, Java, JavaScript, C, C#, C++
- Cody
  - Role: Image tagging/Filter Searching
  - Bio: Senior computer science student with experience in Python, C, C#, C++, simple AI development, running batch jobs on the ARCC HPC.
- Connor
  - Role: Back-end design 
  - Bio: Junior math and computer science major with some experience in web application development. Familiar with HTML, CSS, NodeJS, Express, React, JavaScript, and some database and web-hosting services.
3. Functional requirements of final project/MVP
- Our minimum viable project will be a web-app that allows for viewing and filtering images based on generated tags. The MVP will only generate tags based on information in the metadata of the photo.  There will also be functionality for simple boolean composition of multiple filter specifications.
4. Systems overview
- Front End (React-Based)
  - Responsibilities:
    - User Interface (UI): Develop an intuitive and responsive UI for users to upload photos, view tagged photos, and perform searches.
    - Photo Upload Module: Allows users to upload their photos. Needs to handle file input and possibly preview functionalities.
    - Search Module: A search bar or interface enabling users to perform Boolean searches based on photo tags.
    - Display Results: Showcase search results in a user-friendly manner, possibly as a gallery or grid of images.
  - Development Tasks:
    - Designing the UI layout.
    - Implementing React components for each module (login, search, display).
    - Handling client-side logic for user interactions.

- Back End (Javascript-Based)
  - Responsibilities:
    - Photo Processing: Once a photo is uploaded, process it for tagging (this might involve image recognition, if automated tagging is planned).
    - Tag Management: Store and retrieve tags associated with each photo.
    - Search Logic: Implement the logic for Boolean search based on tags.
  - Development Tasks:
    - Setting up a javascript framework for the back-end server.
    - Developing endpoints for photo uploads, tag retrieval, and search functionalities.
    - Integrating any image processing or tagging libraries if needed.
    - Ensuring robustness and security in data handling and API calls.

- Database (SQLite)
  - Responsibilities:
    - Data Storage: Store photo metadata, tags, and possibly the photos themselves (or references to their storage location).
    - Search and Retrieval: Efficient retrieval of data based on search queries received from the back end.
    - Data Relationships: Handling relationships between photos and tags.
  - Development Tasks:
    - Designing the database schema.
    - Implementing tables for photos, tags, and their relationships.
    - Ensuring efficient indexing to optimize search queries.
    - Managing database connections and transactions from the back end.
5. Major milestones
- Having a working front and back end
- Linking the front and back end
- Be able to link existing storage providers to our interface.
- Applying our filtering system to a group of photos using extracted metadata tags.
- Be able to store persistent data about recent filtration.
- Being able to showcase our product from start to finish from a user perspective.


6. Major tasks 
- Put together directories of photos to be used in unit testing and for demonstration purposes.
- Hosting a website and adding database interactivity.
- Set checkpoints consistent with presentation dates that display functional milestones.
- Write an algorithm to extract tags from metadata and allow filtering based on these tags.
- Implement different options for downloading/organizing results.
7. Stretch goals
- Add functionality to allow for other tagging services to tag the photos.
- Add functionality to import photos from Google Photos/Amazon Photos/other external photo services
- Add a search bar for tags
- Add functionality for the user to define their own tags to be used by the auto tagging services (if they allow for that)
- Integrate dynamic motion into our front-end
