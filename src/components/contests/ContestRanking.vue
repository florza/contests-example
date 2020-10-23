<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div
      v-for="(group, groupNr0) in groups"
      v-bind:key="groupNr0"
    >
      <b-table striped hover class="mb-5"
        :items="groupParticipants(groupNr0 + 1)"
        :fields="displayedFields"
        :primary_key="groupParticipants(groupNr0 + 1).id"
        :sort-by="sortBy"
        :sort-desc.sync="sortDesc"
      >
        <template v-slot:head(name)="data">
          {{ 'Group ' + (groupNr0 + 1) }}
        </template>
        <template v-slot:cell(points)="data">
          {{ data.item.stats && data.item.stats.points }}
        </template>
        <template v-slot:cell(wins)="data">
          {{ getRelevantCounts(data.item.stats.matches) }}
        </template>
        <template v-slot:cell(sets)="data">
          {{ getRelevantCounts(data.item.stats.sets) }}
        </template>
        <template v-slot:cell(games)="data">
          {{ getRelevantCounts(data.item.stats.games) }}
        </template>
      </b-table>
    </div>

  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'

export default {
  name: 'ContestRanking',
  mixins: [apiMixins],
  data () {
    return {
      sortBy: 'stats',
      sortDesc: false,
      fields: [
        { key: 'stats',
          label: 'Rank',
          class: 'text-center',
          tdAttr: { style: 'width: 3em' },
          formatter: 'getRank',
          sortable: true,
          sortByFormatted: true },
        'name',
        { key: 'points', class: 'text-center' },
        { key: 'wins', class: 'text-center' },
        { key: 'sets', class: 'text-center' },
        { key: 'games', class: 'text-center' }
      ]
    }
  },
  computed: {
    groups () {
      if (this.currentContest && this.currentContest.ctype_params) {
        return this.currentContest.ctype_params.draw_tableau || []
      }
      return []
    },
    displayedFields () {
      if (this.currentContest.result_params.winning_sets === 1) {
        return this.fields.filter(o =>
          typeof o === 'string' || o.key !== 'sets')
      }
      return this.fields
    }
  },
  methods: {
    groupParticipants (group) {
      return this.currentParticipants.filter(p =>
        p.ctype_params.draw_group === group)
    },
    getRelevantCounts (allCounts) {
      if (!allCounts) {
        return ''
      }
      let myCounts = allCounts
      if (myCounts.length === 3 &&
          !this.currentContest.result_params.tie_allowed) {
        myCounts = [allCounts[0], allCounts[2]]
      }
      return myCounts.join(':')
    },
    getRank (stats) {
      return stats.rank
    }
  }
}
</script>
