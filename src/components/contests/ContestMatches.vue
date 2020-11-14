<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div v-if="!editedObject">
      <b-table striped hover responsive
          primary-key="currentMatches.id"
          v-bind:items="currentMatches"
          v-bind:fields="displayedFields"
          v-bind:sort-by="sortBy"
          v-bind:sort-desc.sync="sortDesc">
        <template v-slot:cell(grp_group)="data">
          {{ data.item.ctype_params['draw_group'] }}
        </template>
        <template v-slot:cell(grp_round)="data">
          {{ data.item.ctype_params['draw_round'] }}
        </template>
        <template v-slot:cell(ko_round)="data">
          {{ formatKoRound(data.item.ctype_params['draw_round']) }}
        </template>
        <template v-slot:cell(planned_at)="data">
          {{ formatDate(data.value) }}
        </template>
        <template v-slot:cell(participant_1_id)="data">
          <div v-bind:class=
            "{ 'font-weight-bold': data.value === data.item.winner_id }"
          >
            {{ getParticipantName(data.value) }}
          </div>
        </template>
        <template v-slot:cell(participant_2_id)="data">
          <div v-bind:class=
            "{ 'font-weight-bold': data.value === data.item.winner_id }"
          >
            {{ getParticipantName(data.value) }}
          </div>
        </template>
        <template v-slot:cell(result_1_vs_2)="data">
          <div v-if="userOrWriteToken && data.item.result_editable">
            <b-link
              v-on:click="editedObject = data.item"
              variant="success"
            >
              <span v-if="data.value > ''">
                {{ data.value }}
              </span>
              <span v-else>
                <b-icon icon="pencil-square" scale="2"></b-icon>
              </span>
            </b-link>
          </div>
          <div v-else>
            {{ data.value }}
          </div>
        </template>
      </b-table>
    </div>

    <div v-else>
      <contest-match-edit
        v-bind:match="editedObject"
        v-on:finishedAxios="finishedEditing($event)"
      ></contest-match-edit>
    </div>

  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'
import ContestMatchEdit from '@/components/contests/ContestMatchEdit.vue'

export default {
  name: 'ContestMatches',
  mixins: [apiMixins],
  data () {
    return {
      sortBy: 'sort_field',
      sortDesc: true,
      fields: [
        { key: 'sort_field',
          label: 'Sort',
          class: 'd-none',
          formatter: 'getSortValue',
          sortable: true,
          sortByFormatted: true
        },
        { key: 'grp_group', label: 'Group', class: 'text-center' },
        { key: 'grp_round', label: 'Round', class: 'text-center' },
        { key: 'ko_round', label: 'Round', class: 'text-center' },
        { key: 'planned_at', label: 'Date' },
        { key: 'participant_1_id', label: 'Participant 1' },
        { key: 'participant_2_id', label: 'Participant 2' },
        { key: 'result_1_vs_2', label: 'Result', class: 'text-center' }
      ]
    }
  },
  computed: {
    userOrWriteToken () {
      return this.signinType() === 'user' ||
        this.signinData().tokenrole === 'write'
    },
    displayedFields () {
      if (this.currentContest.ctype === 'Groups') {
        return this.fields.filter(f => !f.key.startsWith('ko_'))
      } else {
        return this.fields.filter(f => !f.key.startsWith('grp_'))
      }
    }
  },
  methods: {
    getParticipantName (id) {
      const p = this.currentParticipants.find(p => p.id === id)
      return p ? p.name : ''
    },
    // finishedEditing (confirmation) {
    //   this.editedObject = false
    //   this.confirmation = confirmation
    // },
    getSortValue (value, key, item) {
      if (this.currentContest.ctype === 'Groups') {
        return 1000 * item.ctype_params['draw_group'] +
          item.ctype_params['draw_round']
      } else {
        return 1000 * item.ctype_params['draw_round'] -
          item.ctype_params['draw_pos']
      }
    },
    formatKoRound (value) {
      return value === 1 ? 'Final' : '1/' + value
    }
  },
  components: {
    ContestMatchEdit
  }
}
</script>
