# SFU Synapse
Social Networking Web Application for SFU students

## Situation/Problem
Oftentimes, SFU students have a hard time getting to know classmates and building long-lasting friendships. There is a high chance that a classmate sitting right beside you is also a big fan of your favorite game. However, you would rarely come across such information in a real classroom setting and probably won’t start a conversation, missing out on the opportunity to build a relationship. Our web application will make it easier to discover other students with common interests and help users build and maintain strong connections.

## Features
- **Home page (dashboard)** 
    -  Displays all the connections the user has classified by states (active, inactive, pending) and list of course groups and community groups the user is a member of
- **SFU Email Verification** 
    -  Limits app access to SFU students by verifying their SFU email when creating an account
    -  Sends verification code (valid for 10 mins) to new user's email using Nodemailer
- **Course Groups**
    - Once a user enters their enrolled courses, the user will automatically become a member of these course groups and is able to access the member list and group chat of that course group.
    - **The “Discover” Tab** 
        - Displays list of users in the same group with their profile (bio, course history, involved communities) which allows students to identify others with common interests or classes and to build connect with them.
- **Communities**
    - Users can create "communities", or casual groups, with students that have the same interests. 
    - These communities can be private (only accessible via an invitation from a current community member) or public (accessible to any SFU student). 
    - Users can also join/leave existing communities. 
- **Connections** 
    - Helps users distinguish and filter meaningful connections by providing them the status of each of their connections, in contrast to a Facebook friend list, which is crowded with “friends” you barely know or never talk to.
        - **Pending connection** If user A sends a message to user B for the first time, this indicates the start of a conversation. At this point, this connection is considered “pending”, because a back-and-forth conversation, or mutual connection, has not happened yet. A new record will be inserted into the Connections model in the database with the status “Pending”.
        - **Active connection**. “Pending” status switches to “active” status once user B replies. 
        - **Inactive connections** “Active” connections get moved to “inactive” connections after a long period with no interaction, or exchange of messages. If the user navigates to the private chat of the inactive connection, they will see the following popup: "This connection has been idle for 4 months. Would you like to remove this connection?" Users will have the option to either keep or remove the connection, in which this connection will disappear from their connections list.
- **Admin page**
    - Administrator can browse the list of courses (data fetched from [SFU Course Outline REST API](https://www.sfu.ca/outlines/help/api.html))
    - Administrator can add/remove courses to/from this app


## Technology
Stacks: SERN (MySQL + Express.js + React.js + Node.js)
- [React.js]
- [MySQL]
- [node.js]
- [Express]
- [SFU Course Outline REST API]
- [Bootstrap]


## Installation
Build docker image for MySQL.
```sh
docker-compose build
docker-compose up -d
```
Install the dependencies and devDependencies and start the server.
```sh
cd server
npm install
npm start
```
Install the dependencies and devDependencies and start the client.
```sh
cd client
npm install
npm start
```

---
CMPT372 Web Development Ⅱ - Group Project (Developers: Risa.K, Nathan.L, Jason.N, Rachel.S)





[//]: #
   [MySQL]: <https://www.mysql.com/>
   [node.js]: <http://nodejs.org>
   [Bootstrap]: <https://getbootstrap.com/>
   [express]: <http://expressjs.com>
   [React.js]: <https://react.dev/>
   [SFU Course Outline REST API]: <https://www.sfu.ca/outlines/help/api.html>