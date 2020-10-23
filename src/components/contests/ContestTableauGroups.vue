<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div v-if="currentContest && !editedObject">
      <div v-if="currentContest.ctype == 'Groups' && currentContest.ctype_params.draw_tableau">
        <div
          v-for="(group, groupNr0) in currentContest.ctype_params.draw_tableau"
          v-bind:key="groupNr0"
        >
          <b-table-simple bordered hover class="mb-5">
            <b-thead>
              <b-th style="width: 3em"></b-th>
              <b-th>{{ 'Group ' + (groupNr0 + 1) }}</b-th>
              <b-th
                v-for="pId in group"
                v-bind:key="pId"
                v-bind:style="{ width: Math.floor(60 / group.length) + '%' }"
                class="text-center"
              >
                {{ getParticipantShortName(pId) }}
              </b-th>
            </b-thead>

            <b-tbody>
              <b-tr
                v-for="(pIdRow, rowNr0) in group"
                v-bind:key="pIdRow"
              >
                <b-td class="text-center">{{ rowNr0 + 1 }}</b-td>
                <b-td>{{ getParticipantName(pIdRow) }}</b-td>
                <b-td
                  v-for="(pIdCol, colNr0) in group"
                  v-bind:key="pIdCol"
                  v-bind:class="{ 'bg-secondary': rowNr0 == colNr0 }"
                  class="p-0 m-0 align-middle text-center"
                >
                  <div v-if="rowNr0 !== colNr0 && getMatch(pIdRow, pIdCol)">
                    <div v-if="userOrWriteToken">
                      <b-link
                        v-on:click="editedObject = getMatch(pIdRow, pIdCol)"
                        variant="success"
                      >
                        <span v-if="showMatch(pIdRow, pIdCol) !== 'open'">
                          {{ showMatch(pIdRow, pIdCol) }}
                        </span>
                        <span v-else>
                          <b-icon icon="pencil-square" scale="2">add</b-icon>
                        </span>
                      </b-link>
                    </div>
                    <div v-else>
                      {{ showMatch(pIdRow, pIdCol) }}
                    </div>
                  </div>
                </b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </div>
      </div>
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
  name: 'ContestTableauGroups',
  mixins: [apiMixins],
  data () {
    return {
      match: false
    }
  },
  methods: {
    getParticipantName (id) {
      const p = this.currentParticipants.find(p => p.id === id.toString())
      return p ? p.name : ''
    },
    getParticipantShortName (id) {
      const p = this.currentParticipants.find(p => p.id === id.toString())
      return p ? p.shortname : ''
    },
    getMatch (p1, p2) {
      if (!this.currentMatches || this.currentMatches.length === 0) {
        return false
      }
      return this.currentMatches.find(
        (x) => x.participant_1_id === p1.toString() &&
          x.participant_2_id === p2.toString()
      )
    },
    showMatch (p1, p2) {
      const m = this.getMatch(p1, p2)
      if (!m.result || !m.result.score_p1 || m.result.score_p1.length === 0) {
        return m.planned_at ? this.formatDate(m.planned_at) : 'open'
      }
      return m.result_1_vs_2
    }
  },
  components: {
    ContestMatchEdit
  }
}
</script>
