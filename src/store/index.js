import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    allContests: null,
    currentContest: null,
    currentParticipants: null,
    currentMatches: null,
    emptyDraw: null,
    loadstateContests: 'no load',
    loadstateCurrentContest: 'no load',
    loadstateParticipants: 'no load',
    loadstateMatches: 'no load',
    loadstate: ''
  },

  getters: {
    allContests: state => {
      return state.allContests
    },
    currentContest: state => {
      return state.currentContest
    },
    currentParticipants: state => {
      return state.currentParticipants
    },
    currentMatches: state => {
      return state.currentMatches
    },
    emptyDraw: state => {
      return state.emptyDraw
    },
    loadstateContests: state => {
      return state.loadstateContests
    },
    loadstateCurrentContest: state => {
      return state.loadstateCurrentContest
    },
    loadstateParticipants: state => {
      return state.loadstateParticipants
    },
    loadstateMatches: state => {
      return state.loadstateMatches
    },
    loadstate: state => {
      return state.loadstate
    }
  },

  mutations: {
    // TODO (if possible - no way found so far!) extract duplicate logic
    // into reusable functions.
    setAllContests (state, contestsdata) {
      const contests = contestsdata
        .filter(e => e.type === 'contests')
        .map(e => { e.attributes['id'] = e.id; return e.attributes })
      state.allContests = contests
    },
    setCurrentContest (state, contestdata) {
      if (contestdata.type === 'contests') {
        contestdata.attributes['id'] = contestdata.id
      }
      state.currentContest = contestdata.attributes
    },
    setCurrentParticipants (state, participantsdata) {
      const ppants = participantsdata.filter(e => e.type === 'participants')
        .map(e => { e.attributes['id'] = e.id; return e.attributes })
      state.currentParticipants = ppants
    },
    setCurrentMatches (state, matchesdata) {
      const matches = matchesdata.filter(e => e.type === 'matches')
        .map(e => { e.attributes['id'] = e.id; return e.attributes })
      state.currentMatches = matches
    },
    setEmptyDraw (state, drawsdata) {
      if (drawsdata.type === 'draw') {
        state.emptyDraw = drawsdata.attributes.draw_structure
      } else {
        state.emptyDraw = null
      }
    },
    setLoadstateContests (state, loadstate) {
      state.loadstateContests = loadstate
    },
    setLoadstateCurrentContest (state, loadstate) {
      state.loadstateCurrentContest = loadstate
    },
    setLoadstateParticipants (state, loadstate) {
      state.loadstateParticipants = loadstate
    },
    setLoadstateMatches (state, loadstate) {
      state.loadstateMatches = loadstate
    },
    setLoadstate (state, loadstate) {
      state.loadstate = loadstate
    },
    deleteAll (state) {
      state.allContests = null
      state.currentContest = null
      state.currentParticipants = null
      state.currentMatches = null
      state.emptyDraw = null
      state.loadstateContests = 'no load'
      state.loadstateParticipants = 'no load'
      state.loadstateMatches = 'no load'
    }

  },

  actions: {
    loadContests ({ commit }) {
      commit('setLoadstateContests', 'loading')
      console.log('Start loading Contests')
      Vue.$axios.get('/api/v1/contests') // ?sort=-last_action_at
        .then(response => {
          commit('setAllContests', response.data.data)
          commit('setLoadstateContests', 'loaded')
          console.log(`Successfully loaded ${this.getters.allContests.length} Contests`)
          if (response.data.data.length > 0) {
            // commit('setCurrentContest', response.data.data[0])
            this.dispatch('loadContest')
          } else {
            commit('setCurrentContest', null)
          }
        })
        .catch(error => {
          commit('setLoadstateContests', 'failed')
          console.log('Error loading Contests', error)
          throw new Error(`API ${error}`)
        })
    },

    loadContest ({ commit }) {
      commit('setLoadstateCurrentContest', 'loading')
      console.log('Start loading current Contest')
      const id = this.getters.allContests[0].id
      Vue.$axios.get(
        `/api/v1/contests/${id}?include=participants,matches` +
          '&extra_fields[contests]=token_write,token_read' +
          '&extra_fields[participants]=token_write')
        .then(response => {
          commit('setCurrentContest', response.data.data)
          commit('setCurrentParticipants', response.data.included || [])
          commit('setCurrentMatches', response.data.included || [])
          commit('setLoadstateCurrentContest', 'loaded')
          console.log(`Successfully loaded current Contest` +
            ` (${this.getters.currentParticipants.length} Participants` +
            `, ${this.getters.currentMatches.length} Matches)`)
        })
        .catch(error => {
          commit('setLoadstateCurrentContest', 'failed')
          console.log('Error loading current Contest', error)
          throw new Error(`API ${error}`)
        })
    },

    loadParticipants ({ commit }) {
      if (this.state.currentContest) {
        commit('setLoadstateParticipants', 'loading')
        console.log('Start loading Participants')
        const id = this.getters.currentContest.id
        Vue.$axios.get(`/api/v1/contests/${id}/participants`)
          .then(response => {
            commit('setParticipants', response.data.data)
            commit('setLoadstateParticipants', 'loaded')
            console.log(`Successfully loaded ${this.getters.currentParticipants.length} Participants`)
          })
          .catch(error => {
            commit('setLoadstateParticipants', 'failed')
            console.log('Error loading Participants')
            throw new Error(`API ${error}`)
          })
      }
    },

    loadMatches ({ commit }) {
      if (this.state.currentContest) {
        commit('setLoadstateMatches', 'loading')
        console.log('Start loading Matches')
        const id = this.getters.currentContest.id
        Vue.$axios.get(`/api/v1/contests/${id}/matches`)
          .then(response => {
            commit('setMatches', response.data.data)
            commit('setLoadstateMatches', 'loaded')
            console.log(`Successfully loaded ${this.getters.currentMatches.length} Matches`)
          })
          .catch(error => {
            commit('setLoadstateMatches', 'failed')
            console.log('Error loading Matches')
            throw new Error(`API ${error}`)
          })
      }
    },

    loadEmptyDraw ({ commit }, params) {
      if (this.state.currentContest) {
        // commit('setLoadstateMatches', 'loading')
        console.log('Start loading empty draw')
        const id = this.getters.currentContest.id
        Vue.$axios.get(`/api/v1/contests/${id}/draw`, { params: params })
          .then(response => {
            commit('setEmptyDraw', response.data.data)
            // commit('setLoadstateMatches', 'loaded')
            console.log(`Successfully loaded empty draw`)
          })
          .catch(error => {
            // commit('setLoadstateMatches', 'failed')
            console.log('Error loading empty draw')
            throw new Error(`API ${error}`)
          })
      }
    }
  }
})
