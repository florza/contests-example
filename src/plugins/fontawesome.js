import Vue from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// From old main.js:
// import { library, dom } from '@fortawesome/fontawesome-svg-core'
// Import only icons that are used in the app!
// import {
//   faArrowUp, faArrowDown, faChevronCircleLeft, faChevronCircleRight,
//   faCalendarCheck, faTrashAlt, faTimesCircle, faClock, faCalendar
// }
//   from '@fortawesome/free-solid-svg-icons'
// import

library.add(fas)
// From old main.js:
// library.add(faArrowUp, faArrowDown, faChevronCircleLeft, faChevronCircleRight,
//   faCalendarCheck, faTrashAlt, faTimesCircle, faClock, faCalendar)
// // Start the automatic replacement of i to svg tags
// dom.watch()

Vue.component('font-awesome-icon', FontAwesomeIcon)
