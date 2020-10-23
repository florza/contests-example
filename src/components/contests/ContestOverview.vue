<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <b-table-simple v-if="currentContest" borderless small>
      <b-tbody>
        <b-tr>
          <b-td>Type of Contest:</b-td>
          <b-td>{{ ctype_text(currentContest.ctype) }}</b-td>
        </b-tr>
        <b-tr>
          <b-td>Contest settings:</b-td>
          <b-td>{{ getResultParams() }}</b-td>
        </b-tr>
        <b-tr v-if="this.signinType() === 'user'">
          <b-td>Contestkey (read-only):</b-td>
          <b-td>{{ currentContest.token_read }}</b-td>
        </b-tr>
        <b-tr v-if="this.signinType() === 'user'">
          <b-td>Contestkey (edit all results):</b-td>
          <b-td>{{ currentContest.token_write }}</b-td>
        </b-tr>
        <b-tr>
          <b-td>Date of draw:</b-td>
          <b-td>
            <span v-if="currentContest.draw_at">
              {{ currentContest.draw_at.split('T')[0] }}
            </span>
            <span v-else>-</span>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>Number of groups:</b-td>
          <b-td>{{ getNumberOfGroups() }}</b-td>
        </b-tr>
        <b-tr>
          <b-td>Number of Participants:</b-td>
          <b-td>{{ currentParticipants && currentParticipants.length }}</b-td>
        </b-tr>
        <b-tr>
          <b-td>Number of Matches:</b-td>
          <b-td>{{ currentMatches && currentMatches.length }}</b-td>
        </b-tr>
        <b-tr>
          <b-td>Number of played Matches:</b-td>
          <b-td>{{ currentMatches && playedMatches.length }}</b-td>
        </b-tr>
      </b-tbody>
  </b-table-simple>
  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'

export default {
  name: 'ContestOverview',
  mixins: [apiMixins],
  computed: {
    playedMatches () {
      return this.currentMatches.filter(m => m.winner_id !== null) || []
    }
  },
  methods: {
    getNumberOfGroups () {
      const params = this.currentContest.ctype_params
      return (params && params.grp_groups && params.grp_groups.length) || '-'
    },
    getResultParams () {
      const params = this.currentContest.result_params
      if (!params) {
        return '-'
      }
      const sets = (params.winning_sets || 1) + ' winning set(s)'
      const tie = params.tie_allowed ? ', ties allowed' : ', no tie'
      let points = ''
      if (params.points) {
        points = ', ' + params.points.win + '/' +
          (params.tie_allowed ? params.points.tie + '/' : '') +
          params.points.loss + ' points'
      }
      return sets + tie + points
    }
  }
}
</script>
