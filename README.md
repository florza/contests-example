# Contests-Example

## Description
This is a Vue.js app which serves as Proof Of Concept and working example for the simple user-facing front-end of a contest management app which uses the *Contests-Engine* for the more complicated task (see below).

The app provides
- a minimal user handling to register, login, logout and refresh users (contests managers) and their authentication
- a login for participants of contests with different tokens that give access to read a specific contest or to edit match results of all matches of a contests or of one participants matches
- forms to manage contest and participants by the contest manager
- a form to handle complete or partial manual draws and let them be completed by the backend,  as well as completely automatic seeded draws
- views of the drawn tableau, generated matches and ranking lists
- a form to add or change the result of matches

The app does not permanently store any data or manage the flow of the contest. It only displays data and (mostly) simple forms, does some local validations to avoid the round trip over the backend and then sends the necessary requests to the back-end. Its most complicated parts at the moment are the handling of a "draw" form for manually defining a draw by dragging around participants and the display of the "knock-out tableau" with its complicated structure of lines and labels that does not easily fit into rows and columns or a table.

Currently the app supports the following types of contests:
- Groups (round robin), where the participants in each group play against each other; propagation of group winners in a final group or an elimination round is not yet implemented
- KO (knock-out or elimination game), where only the winner of each game advances to next round until the final

## Contests-Engine
Contest-Engine is a site  which is currently being devolopped. It provides a public API to a tournament management back-end system that handles contests, participants, draws, matches and the like for almost any contest (football championships, tennis trophies, billard tournaments and so on). Details can be found at https://github.com/florza/contests-engine.

All data of users, contests, participants and matches is stored and retrieved by sending API request to this back-end. Also actions like randomly filling an incomplete draw, creating the matches for each round, propagating the winner of a elimination game to the next round, calculating rankings, propagating group winners to the final group or elimination round and so on are all automatically done by this back-end system when it receives a changed draw or an updated match result.

## Demo
The app is running on Heroku at https://contests-example.herokuapp.com to get a first impression. However, this installation is also used by the developer sometimes and no guarantee is given on availability of the app or permanent storage of example data you entered. The app and the database may be overwritten or initialized at any time.
