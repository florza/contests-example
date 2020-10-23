# it2front

A Vue.js front-end app as Proof of Concept for a new Ruby on Rails backend app.
This project is clone of iturnier2frontend that has been set up from scratch with Vue CLI in order to get a up-to-date configuration with no unnecessary dependencies.

## Open tasks
- Set the number of seeds in draws
- In-Place-Editing for participants and contests, e.g. https://cukikt0302.github.io/vue-simple-table/index.html
- More adaptions for small screens
- URLs with ContestId
- "Loading display" with slot <table-busy> (see BootstrapyVue Doku)

## Recent tasks
- Reading contest in one API-call, including participants and matches
- Params and results of API calls to backend in JSON-API format
- Show in page header if connected to Heroku
- Vue-Bootstrap-DateTime-Picker for match.planned_at, show planned_at with time in all views
- KO-Tableau
- Refactored display of 'loading...' and confirmation messages
- Corrected choice of displaying saved, actual or empty drawTableau
- Non-standard group sizes and BYE positions are allowed
- Buttons for larger/smaller group size, with automatic reduction/enlargement of the next possible group to keep the right number of slots
- Improved draggble handling in Draw
  - Slots for BYEs and empty places in drawTableau
  - Entries are swapped within drawTableau, not sorted
  - BYEs can be moved, too, if the user wants to place them himself
  - no animation for inserts and the like (but yet no coloring of the actual target position, too)
- Combined KO and groups draw in a general component to avoid lots of duplication
- Adapted param-names to backend changes (draw_ instead of grp_/ko_)
- Adapted rankings to choose columns and sort order depending on ctype
- First draft of KO draw, with display of BYE positions, buttons to generate and delete a draw
- Made display of add/edit/delete buttons dependent on the login type (user, read token or write token), show result as a link instead of a button
- Adapt ranking display to settings, e.g. no tie columns if no tie allowed and no sets when only 1 possible set
- Overhaul of components structures (pattern for editing pages, base component for messages, more definitions of table cells in fields array instead of template tags)
- Ranking per group is computed by the backend
- adapedt Match edit to restructured result (score_p1, score_p2)
- handling of the information that is now returned after signin, describing the user or the token
- second login form in signin for authorization with a token, which is then handled the same way as it were a user
- renamed email to username, as it is now so named in the backend
- tableau of the groups in 2D
- refactored match editing into an own component
- Improved form for result entry with
  - input fiels for every possible set
  - winner or tie (if allowed)
  - walk-over and lucky-loser (will only be used in KO)
  - input of planned date with date-picker
- improvements in error handling and display
- Simple implementation of groups draw that allows almost all inputs, e.g. without controlling equal group sizes
- Collapseable nav bar instead of pills


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
