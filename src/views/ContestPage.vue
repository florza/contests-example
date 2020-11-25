<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <base-messages
          v-bind:confirmation="confirmation"
          v-bind:errors="errors"
        ></base-messages>
        <the-header></the-header>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div v-if="currentContest">
          <h3>{{ currentContest.name }}</h3>
          <div class="float-right">

          </div>
          <b-navbar toggleable="md" type="light" variant="light" class="px-0 pb-0">
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
            <b-collapse id="nav-collapse" is-nav>
              <b-nav tabs class="px-0">
                <b-nav-item
                  v-for="tab in tabs"
                  v-bind:key="tab"
                  v-bind:active="tabActive(tab)"
                  v-bind:disabled="tabDisabled(tab)"
                  v-bind:to="tabPath(tab)"
                >
                  {{ tabName(tab) }}
                </b-nav-item>
              </b-nav>
            </b-collapse>
            <b-nav v-if="signinType() === 'user'" class="ml-auto">
              <b-nav-item to="/contests">All Contests</b-nav-item>
            </b-nav>
          </b-navbar>
        </div>
        <component v-bind:is="currentTabComponent" class="tab"></component>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'
import TheHeader from '@/components/TheHeader.vue'
import ContestOverview from '@/components/contests/ContestOverview.vue'
import ContestParticipants from '@/components/contests/ContestParticipants.vue'
import ContestDraw from '@/components/contests/ContestDraw.vue'
import ContestTableauGroups from '@/components/contests/ContestTableauGroups.vue'
import ContestTableauKo from '@/components/contests/ContestTableauKo.vue'
import ContestMatches from '@/components/contests/ContestMatches.vue'
import ContestRanking from '@/components/contests/ContestRanking.vue'

export default {
  name: 'ContestPage',
  mixins: [apiMixins],
  props: { tab: String },
  data () {
    return {
      tabs: [
        'overview', 'participants', 'draw',
        'tableau', 'matches', 'ranking'
      ]
    }
  },
  created () {
    if (!this.allContests || this.allContests.length === 0) {
      this.$store.dispatch('loadContests')
    }
    // this.checkContestsExist()
  },
  // watch: {
  //   currentContest: {
  //     immediate: true,
  //     deep: true,
  //     handler: function (newContests, oldContests) {
  //       if (newContests) {
  //         // this.$store.dispatch('loadContest')
  //       }
  //     }
  //   }
  // },
  computed: {
    loadstateCurrentContest () {
      this.checkContestsExist()
      return this.$store.getters.loadstateCurrentContest
    },
    currentTab () {
      if (!this.tab) {
        if (this.currentContest && this.currentContest.draw_at) {
          return 'tableau'
        } else {
          return 'overview'
        }
      }
      return this.tab
    },
    currentTabComponent () {
      let component = 'contest-' + this.currentTab
      if (this.currentTab === 'tableau') {
        component += '-' + this.currentContest.ctype.toLowerCase()
      }
      return component
    }
  },
  methods: {
    checkContestsExist () {
      if (this.$store.getters.loadstateCurrentContest === 'loaded' &&
          this.$store.getters.allContests.length === 0) {
        this.$router.replace('/contests')
      }
    },
    tabName (tab) {
      return tab.substr(0, 1).toUpperCase() + tab.substr(1)
    },
    tabActive (tab) {
      return tab === this.currentTab
    },
    tabDisabled (tab) {
      switch (tab) {
        case 'draw':
          return this.currentParticipants.length < 2
        case 'tableau':
        case 'matches':
        case 'ranking':
          return !this.currentContest.has_draw
        default:
          return false;
      }
    },
    tabPath (tab) {
      return '/contest/' + tab
    }
  },
  components: {
    TheHeader,
    ContestOverview,
    ContestParticipants,
    ContestDraw,
    ContestTableauGroups,
    ContestTableauKo,
    ContestMatches,
    ContestRanking
  }
}
</script>

<style>
.nav-link {
  padding: .5rem .5rem;
}
.tab {
  margin-top: 1.5rem;
}
</style>
