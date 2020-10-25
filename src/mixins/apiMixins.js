export const apiMixins = {
  data () {
    return {
      // general fields to communicate between components
      editedObject: false,
      errors: [],
      confirmation: ''
    }
  },
  created () {
    console.log('Creating component ' + this.$options.name)
  },
  computed: {
    allContests () {
      return this.$store.getters.allContests || []
    },
    currentContest () {
      return this.$store.getters.currentContest || []
    },
    currentParticipants () {
      return this.$store.getters.currentParticipants || []
    },
    currentMatches () {
      return this.$store.getters.currentMatches || []
    },
    loadstate () {
      return this.$store.getters.loadstate
    },
    userOrWriteToken () {
      return this.signinType() === 'user' ||
        this.signinData().tokenrole === 'write'
    }
  },
  methods: {

    // Methods to communicate between editing component and parent
    finishedAxios (message) {
      this.$emit('finishedAxios', message)
    },
    onReset () {
      this.editedObject = false
      this.$emit('finishedAxios', null)
    },
    finishedEditing (confirmation) {
      this.editedObject = false
      this.confirmation = confirmation
    },

    // Axios methods for sign up, sign in, sign out
    callAxiosSignInUp (path, data) {
      this.$axios.post(path, data)
        .then(response => this.signInUpSuccessful(response, path))
        .catch(error => this.signInUpFailed(error, path))
    },
    callAxiosSignout (path) {
      this.callAxiosAPI(this.axios.delete, path)
    },
    signInUpSuccessful (response, path) {
      if (!response.data.auth) {
        this.signinFailed(response)
        return
      }
      localStorage.auth = response.data.auth
      localStorage.signedIn = true
      localStorage.signinType = response.data.signin_type
      localStorage.signinData = JSON.stringify(response.data.signin_data)
      this.$axios.defaults.headers.common['Authorization'] = response.data.auth

      this.errors = []
      this.$store.commit('deleteAll')
      this.$router.replace(path === '/signin' ? '/contest' : '/contests')
    },
    signInUpFailed (error, path) {
      delete localStorage.auth
      delete localStorage.signedIn
      delete localStorage.signinType
      delete localStorage.signinData
      this.setError(error,
        'could not ' + (path === '/signin' ? 'sign in' : 'sign up'))
      this.$store.commit('deleteAll')
    },
    signinType () {
      return localStorage.signinType
    },
    signinData () {
      return JSON.parse(localStorage.signinData)
    },

    // Axios methods for data manipulations (post, patch, delete)
    callAxiosAdd (path, action, object, editedObject = null,
      data = undefined, loadstate = '') {
      this.callAxiosAPI(this.$axios.post,
        path, action, object, editedObject, data, loadstate)
    },
    callAxiosDelete (path, action, object, editedObject = null,
      loadstate = '') {
      this.callAxiosAPI(this.$axios.delete,
        path, action, object, editedObject, loadstate)
    },
    callAxiosUpdate (path, action, object, editedObject = null,
      data = undefined, loadstate = '') {
      this.callAxiosAPI(this.$axios.patch,
        path, action, object, editedObject, data, loadstate)
    },
    callAxiosAPI (axiosFunction, path, action, object, editedObject,
      data, loadstate) {
      console.log(`Start ${action} ${object}`)
      this.$store.commit('setLoadstate', loadstate || `${action} ${object}...`)
      return (
        axiosFunction(path, this.to_jsonapi(path, data),
          { headers: { 'Authorization': localStorage.auth } })
          .then(() => {
            console.log(`Succesfully finished ${action} ${object}`)
            if (object === 'Contest') {
              this.$store.dispatch('loadContests')
            } else {
              this.$store.dispatch('loadContest')
            }
            if (editedObject) {
              this.editedObject = false
            }
            const message = `${object} successfully ${action}d`
            this.$store.commit('setLoadstate', '')
            this.confirmation = message
            this.finishedAxios(message)
            this.errors = []
          })
          .catch(error => {
            console.log(`Error in ${action} ${object}`, error)
            this.$store.commit('setLoadstate', '')
            this.setError(error, `Cannot ${action} ${object}`)
          })
      )
    },

    // Transform the data object to a JSON-API object
    to_jsonapi (path, data) {
      let result = null
      const parts = path.split('/')
      if (parts.length % 2 === 0) {
        result = { type: parts[parts.length - 1] }
      } else {
        result =
          { type: parts[parts.length - 2],
            id: parts[parts.length - 1] }
      }
      const key = Object.keys(data)[0]
      result['attributes'] = data[key]
      return { data: result }
    },

    // Extract meaningful error message from returned error data
    setError (error, text) {
      let errorMessages = ''
      let defaulttext = ''
      if (error.response) {
        defaulttext =
          `${text} (${error.response.status}, ${error.response.statusText})`
        const errordetail = error.response.data.errors || []
        errorMessages = errordetail.map(e => {
          if (e.status === '422') {
            return `${e.meta.attribute}: ${e.meta.message}`
          }
          return `${e.code}: ${e.detail}`
        })
      } else {
        errorMessages = [`${error.message || 'Unknown Error'}, ${text}`]
      }
      this.errors = errorMessages || [defaulttext]
    },

    // Helper methods
    formatDate (date) {
      if (date === '') {
        return date
      }
      return date.substring(0, 10) + ' ' + date.substring(11, 16)
    },
    ctype_text (ctype) {
      switch (ctype) {
        case 'Groups': return 'Groups (round-robin)'
        case 'KO': return 'Knockout (single-elimination)'
        default: return ctype
      }
    }
  }
}
